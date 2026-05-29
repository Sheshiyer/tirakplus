import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false, // sequential — tests share session state across passes
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:8787",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Reuse an already-running wrangler dev server when present.
  // Start it manually first: npm run dev
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8787",
    reuseExistingServer: true,
    timeout: 90_000,
  },
});
