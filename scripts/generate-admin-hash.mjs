/**
 * Generátor ADMIN_PASSWORD_HASH pro bothub.cz
 *
 * Použití:
 *   node scripts/generate-admin-hash.mjs
 *
 * Nebo s argumenty:
 *   node scripts/generate-admin-hash.mjs "moje-heslo" "muj-jwt-secret"
 */

import { createHmac } from "crypto";
import { createInterface } from "readline";

const args = process.argv.slice(2);

async function askQuestion(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log("=".repeat(50));
  console.log("  bothub.cz — Admin Password Hash Generator");
  console.log("=".repeat(50));
  console.log();

  let password = args[0];
  let jwtSecret = args[1];

  if (!password) {
    password = await askQuestion("Zadej heslo pro admina: ");
  }

  if (!jwtSecret) {
    jwtSecret = await askQuestion("Zadej JWT_SECRET (min. 32 znaků): ");
  }

  if (!password || password.length < 8) {
    console.error("❌ Heslo musí mít alespoň 8 znaků!");
    process.exit(1);
  }

  if (!jwtSecret || jwtSecret.length < 32) {
    console.error("❌ JWT_SECRET musí mít alespoň 32 znaků!");
    process.exit(1);
  }

  const hash = createHmac("sha256", jwtSecret).update(password).digest("hex");

  console.log();
  console.log("✅ Hash vygenerován!");
  console.log();
  console.log("Přidej do Railway environment variables (nebo .env):");
  console.log("-".repeat(50));
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log("-".repeat(50));
  console.log();
  console.log("⚠️  Heslo si bezpečně ulož — hash nelze zpětně dekódovat.");
}

main().catch(console.error);
