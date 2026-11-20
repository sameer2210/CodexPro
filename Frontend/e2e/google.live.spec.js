import { test } from "@playwright/test";

/**
 * LIVE Google browser integration — intentionally skipped by default.
 * Set RUN_LIVE_GOOGLE_E2E=1 and provide a real Google test account +
 * VITE_GOOGLE_CLIENT_ID matching Backend GOOGLE_CLIENT_ID before enabling.
 *
 * Do not treat mocked GIS / google-auth-library unit tests as proof of
 * live Google Sign-In.
 */
test.describe("Live Google Sign-In (real account)", () => {
  test.skip(
    process.env.RUN_LIVE_GOOGLE_E2E !== "1",
    "Live Google E2E disabled. Enable only with a dedicated Google test account.",
  );

  test("placeholder — implement with real Google test account credentials", async () => {
    test.fail(
      true,
      "No live Google test account wired in CI. Manual verification required.",
    );
  });
});
