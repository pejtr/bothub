export const ENV = {
  // Auth
  cookieSecret:      process.env.JWT_SECRET ?? "",
  adminEmail:        process.env.ADMIN_EMAIL ?? "",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
  ownerOpenId:       process.env.OWNER_OPEN_ID ?? "",

  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",

  // AI / LLM (Google Gemini — nahrazuje Manus Forge API)
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY ?? "",

  // Email (nodemailer)
  smtpHost:  process.env.SMTP_HOST ?? "",
  smtpPort:  parseInt(process.env.SMTP_PORT ?? "587"),
  smtpUser:  process.env.SMTP_USER ?? "",
  smtpPass:  process.env.SMTP_PASS ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "noreply@bothub.cz",

  // LeadOS integrace
  leadConnectApiKey: process.env.LEADCONNECT_API_KEY ?? "",

  // Stripe
  stripeSecretKey:     process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",

  // GSC
  gscVerification: process.env.VITE_GSC_VERIFICATION ?? "",

  // Flags
  isProduction: process.env.NODE_ENV === "production",
};
