const baseUrl = process.env.APP_SMOKE_BASE_URL || "http://127.0.0.1:8787";

const routes = [
  "/privacy",
  "/terms",
  "/cookies",
  "/support",
  "/cities/bangkok",
  "/not-real-route",
  "/site.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
];

const requiredHeaders = [
  "content-security-policy",
  "referrer-policy",
  "x-content-type-options",
  "x-frame-options",
];

for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`);
  if (response.status !== 200) {
    throw new Error(`${route}: expected 200, got ${response.status}`);
  }
  if (!route.endsWith(".xml") && !route.endsWith(".txt") && !route.endsWith(".webmanifest")) {
    for (const header of requiredHeaders) {
      if (!response.headers.get(header)) {
        throw new Error(`${route}: missing ${header}`);
      }
    }
  }
}

console.log(`App smoke passed for ${routes.length} routes at ${baseUrl}.`);
