import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:5173";

/**
 * Auth E2E. Google Sign-In coverage here uses a mocked GIS client only.
 * Live Google account login is NOT asserted unless RUN_LIVE_GOOGLE_E2E=1
 * and a real Google test account is provided (see e2e/google.live.spec.js).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev -- --host 127.0.0.1 --port 5173",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          ...process.env,
          // Enables GIS button mount so E2E can stub window.google (still mocked — not live Google)
          VITE_GOOGLE_CLIENT_ID:
            process.env.VITE_GOOGLE_CLIENT_ID ||
            "e2e-test-client.apps.googleusercontent.com",
        },
      },
});

