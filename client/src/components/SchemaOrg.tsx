import { useMemo } from "react";
import { ibots, categories } from "@/data/ibots";

/** Generates the base URL from window.location.origin or fallback */
function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://bothub.cz";
}

// ===== Organization JSON-LD =====
export function OrganizationSchema() {
  const baseUrl = getBaseUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BOTHUB",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "BOTHUB.cz — platforma AI chatbotů (iBotů) pro automatizaci prodeje, zákaznické podpory a osobního rozvoje. 88 AI osobností ve 7 kategoriích.",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@bothub.cz",
      contactType: "customer service",
      availableLanguage: ["Czech", "English"],
    },
    sameAs: [
      "https://api.bothub.cz",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ===== WebSite JSON-LD =====
export function WebSiteSchema() {
  const baseUrl = getBaseUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BOTHUB",
    url: baseUrl,
    description:
      "AI chatboti, kteří prodávají za vás. 88 AI osobností ve 7 kategoriích.",
    inLanguage: ["cs", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/#catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ===== BreadcrumbList JSON-LD =====
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const baseUrl = getBaseUrl();
  const schema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
      })),
    }),
    [items, baseUrl]
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ===== Product JSON-LD for pricing plans =====
interface PricingPlanSchemaProps {
  locale: "cs" | "en";
}

export function PricingPlansSchema({ locale }: PricingPlanSchemaProps) {
  const baseUrl = getBaseUrl();
  const plans = [
    {
      name: locale === "cs" ? "BOTHUB FREE" : "BOTHUB FREE",
      description:
        locale === "cs"
          ? "1 iBot, 100 zpráv/měsíc, web widget, komunitní podpora"
          : "1 iBot, 100 messages/month, web widget, community support",
      price: "0",
      currency: "CZK",
      sku: "bothub-free",
    },
    {
      name: locale === "cs" ? "BOTHUB GOLD" : "BOTHUB GOLD",
      description:
        locale === "cs"
          ? "Až 10 iBotů, 5 000 zpráv/měsíc, všechny platformy, prioritní podpora, A/B testování"
          : "Up to 10 iBots, 5,000 messages/month, all platforms, priority support, A/B testing",
      price: locale === "cs" ? "990" : "39",
      currency: locale === "cs" ? "CZK" : "USD",
      sku: "bothub-gold",
    },
    {
      name: locale === "cs" ? "BOTHUB DIAMOND" : "BOTHUB DIAMOND",
      description:
        locale === "cs"
          ? "Neomezení iBoti, neomezené zprávy, vlastní API, dedikovaný manažer, white-label"
          : "Unlimited iBots, unlimited messages, custom API, dedicated manager, white-label",
      price: locale === "cs" ? "2490" : "99",
      currency: locale === "cs" ? "CZK" : "USD",
      sku: "bothub-diamond",
    },
  ];

  const schemas = plans.map((plan) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    description: plan.description,
    sku: plan.sku,
    brand: {
      "@type": "Brand",
      name: "BOTHUB",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/#pricing`,
      priceCurrency: plan.currency,
      price: plan.price,
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "BOTHUB",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    category: "Software > AI Chatbot",
  }));

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// ===== SoftwareApplication JSON-LD for individual iBots =====
export function IBotCatalogSchema() {
  const baseUrl = getBaseUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "BOTHUB iBot Katalog",
    description: "88 AI osobností ve 7 kategoriích pro automatizaci prodeje a osobního rozvoje",
    numberOfItems: ibots.length,
    url: `${baseUrl}/#catalog`,
    itemListElement: categories.map((cat, catIndex) => ({
      "@type": "ListItem",
      position: catIndex + 1,
      name: cat.nameCs,
      url: `${baseUrl}/#catalog`,
      item: {
        "@type": "ItemList",
        name: cat.nameCs,
        description: cat.description,
        numberOfItems: ibots.filter((b) => b.category === cat.id).length,
        itemListElement: ibots
          .filter((b) => b.category === cat.id)
          .slice(0, 3) // Top 3 per category for brevity
          .map((bot, botIndex) => ({
            "@type": "ListItem",
            position: botIndex + 1,
            name: bot.name,
            item: {
              "@type": "SoftwareApplication",
              name: `${bot.name} iBot`,
              description: bot.description,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CZK",
                description: "Dostupné v rámci BOTHUB plánů",
              },
            },
          })),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ===== FAQPage JSON-LD =====
interface FAQSchemaItem {
  question: string;
  answer: string;
}

interface FAQPageSchemaProps {
  items: FAQSchemaItem[];
}

export function FAQPageSchema({ items }: FAQPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ===== Combined Schema for Home page =====
interface HomePageSchemaProps {
  locale: "cs" | "en";
  faqItems: FAQSchemaItem[];
}

export function HomePageSchema({ locale, faqItems }: HomePageSchemaProps) {
  const baseUrl = getBaseUrl();

  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <BreadcrumbSchema
        items={[
          { name: locale === "cs" ? "Domů" : "Home", url: "/" },
        ]}
      />
      <PricingPlansSchema locale={locale} />
      <IBotCatalogSchema />
      <FAQPageSchema items={faqItems} />
    </>
  );
}

// ===== Blog Article Schema =====
interface BlogArticleSchemaProps {
  title: string;
  description: string;
  slug: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category?: string;
}

export function BlogArticleSchema({
  title,
  description,
  slug,
  author,
  publishedAt,
  updatedAt,
  category,
}: BlogArticleSchemaProps) {
  const baseUrl = getBaseUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${baseUrl}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "BOTHUB",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${slug}`,
    },
    ...(category && { articleSection: category }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
