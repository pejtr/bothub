import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Stripe webhook needs raw body BEFORE express.json()
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }
    try {
      const { constructWebhookEvent } = await import("../stripe");
      const event = constructWebhookEvent(req.body as Buffer, sig);

      // Test event verification
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      // Handle payment events
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const registrationId = parseInt(session.metadata?.registration_id || "0");
        const plan = session.metadata?.plan;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (registrationId && plan) {
          const { activateRegistration, updateRegistrationStripe } = await import("../db");
          await activateRegistration(registrationId);
          await updateRegistrationStripe(registrationId, stripeCustomerId, stripeSubscriptionId);
          console.log(`[Webhook] Activated registration ${registrationId} for plan ${plan}`);

          const { notifyOwner } = await import("./notification");
          await notifyOwner({
            title: `Platba dokončena: ${plan.toUpperCase()}`,
            content: `Registrace #${registrationId}\nPlán: ${plan.toUpperCase()}\nStripe Customer: ${stripeCustomerId}\nSubscription: ${stripeSubscriptionId}`,
          }).catch(() => {});
        }
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error("[Webhook] Error:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Dynamic sitemap.xml — reads published blog posts from DB
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const { getPublishedBlogPosts } = await import("../db");
      const baseUrl = _req.headers["x-forwarded-host"]
        ? `${_req.headers["x-forwarded-proto"] || "https"}://${_req.headers["x-forwarded-host"]}`
        : `${_req.protocol}://${_req.get("host")}`;

      const blogPosts = await getPublishedBlogPosts().catch(() => []);
      const now = new Date().toISOString().split("T")[0];

      // Import ibots for sitemap
      const { ibots } = await import("../../client/src/data/ibots");

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly", lastmod: now },
        { loc: "/blog", priority: "0.8", changefreq: "daily", lastmod: now },
        { loc: "/#catalog", priority: "0.7", changefreq: "weekly", lastmod: now },
        { loc: "/#pricing", priority: "0.7", changefreq: "monthly", lastmod: now },
        { loc: "/#affiliate", priority: "0.6", changefreq: "monthly", lastmod: now },
        { loc: "/#faq", priority: "0.5", changefreq: "monthly", lastmod: now },
      ];

      const blogUrls = blogPosts.map((post: any) => ({
        loc: `/blog/${post.slug}`,
        priority: "0.6",
        changefreq: "monthly",
        lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString().split("T")[0] : now,
      }));

      // Add all iBot detail pages (88 iBots)
      const ibotUrls = ibots.map((ibot: any) => ({
        loc: `/ibot/${ibot.id}`,
        priority: ibot.featured ? "0.7" : "0.6",
        changefreq: "monthly",
        lastmod: now,
      }));

      const allUrls = [...staticPages, ...blogUrls, ...ibotUrls];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (error) {
      console.error("[Sitemap] Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Google Search Console verification HTML file (alternative verification method)
  app.get("/google:verificationCode.html", (_req, res) => {
    const code = process.env.VITE_GSC_VERIFICATION || "";
    if (!code) return res.status(404).send("Not found");
    res.set("Content-Type", "text/html");
    res.send(`google-site-verification: google${code}.html`);
  });

  // Sitemap ping endpoint — notifies Google about sitemap updates
  app.get("/api/sitemap/ping", async (_req, res) => {
    try {
      const baseUrl = _req.headers["x-forwarded-host"]
        ? `${_req.headers["x-forwarded-proto"] || "https"}://${_req.headers["x-forwarded-host"]}`
        : `${_req.protocol}://${_req.get("host")}`;
      const sitemapUrl = `${baseUrl}/sitemap.xml`;
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

      const response = await fetch(pingUrl, { method: "GET", signal: AbortSignal.timeout(10000) });
      console.log(`[Sitemap Ping] Google notified: ${response.status}`);
      res.json({
        success: true,
        sitemapUrl,
        googlePingStatus: response.status,
        message: "Sitemap submitted to Google successfully",
      });
    } catch (error: any) {
      console.error("[Sitemap Ping] Error:", error.message);
      res.json({
        success: false,
        error: error.message,
        message: "Failed to ping Google. You can manually submit at Google Search Console.",
      });
    }
  });

  // robots.txt — allows crawlers, blocks admin, links to sitemap
  app.get("/robots.txt", (_req, res) => {
    const baseUrl = _req.headers["x-forwarded-host"]
      ? `${_req.headers["x-forwarded-proto"] || "https"}://${_req.headers["x-forwarded-host"]}`
      : `${_req.protocol}://${_req.get("host")}`;

    const robotsTxt = `# BOTHUB.cz — AI chatboti, kteří prodávají za vás
# https://bothub.cz

User-agent: *
Allow: /
Allow: /blog
Allow: /blog/
Disallow: /admin
Disallow: /dashboard
Disallow: /affiliate-dashboard
Disallow: /api/
Disallow: /activate

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;
    res.set("Content-Type", "text/plain");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(robotsTxt);
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
