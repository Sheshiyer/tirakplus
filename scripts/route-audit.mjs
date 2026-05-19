import { readFile, access } from "node:fs/promises";

const main = await readFile("src/app/main.tsx", "utf8");
const requiredRoutes = [
  "/",
  "overview",
  "cities/bangkok",
  "cities/phuket",
  "discovery",
  "safety",
  "payments",
  "privacy",
  "terms",
  "cookies",
  "support",
  "auth/login",
  "*",
];

const requiredFiles = [
  "public/favicon.ico",
  "public/favicon-192.png",
  "public/apple-touch-icon.png",
  "public/site.webmanifest",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/.well-known/security.txt",
];

const missingRoutes = requiredRoutes.filter((route) => !main.includes(route));
if (missingRoutes.length) {
  console.error(`Missing route declarations: ${missingRoutes.join(", ")}`);
  process.exit(1);
}

const missingFiles = [];
for (const file of requiredFiles) {
  try {
    await access(file);
  } catch {
    missingFiles.push(file);
  }
}

if (missingFiles.length) {
  console.error(`Missing launch static files: ${missingFiles.join(", ")}`);
  process.exit(1);
}

console.log(`Route/static audit passed: ${requiredRoutes.length} routes and ${requiredFiles.length} files.`);
