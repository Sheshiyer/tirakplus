import { readFile, access } from "node:fs/promises";

const required = [
  ["dist/index.html", "Tirak Plus"],
  ["public/site.webmanifest", "Tirak Plus"],
  ["public/robots.txt", "Sitemap:"],
  ["public/sitemap.xml", "https://tirakplus.com/privacy"],
  ["public/.well-known/security.txt", "Contact:"],
];

for (const [file, expected] of required) {
  await access(file);
  const text = await readFile(file, "utf8");
  if (!text.includes(expected)) {
    throw new Error(`${file} did not include expected text: ${expected}`);
  }
}

console.log(`Static smoke passed across ${required.length} launch files.`);
