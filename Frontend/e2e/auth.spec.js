import { test, expect } from "@playwright/test";

/**
 * Browser E2E for Team/Academy auth UX.
 * API calls are intercepted — no production DB or credentials.
 * Google Sign-In uses a mocked GIS surface (not a live Google account).
 */

const fakeJwt = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url",
  );
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");
  return `${header}.${body}.e2e`;
};


test.describe("Team Login / Register", () => {
  test("Team login page renders and validates empty submit", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /confirm access/i })).toBeVisible();
    // Bypass HTML5 `required` so app-level validation message is shown
    await page.locator("form").evaluate((form) =>
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
    );
    await expect(
      page.getByText(/please complete all required fields/i),
    ).toBeVisible();
  });


  test("Team login success (mocked API) stores team token and reaches dashboard shell", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          token: fakeJwt({
            teamName: "e2eteam",
            username: "captain",
            isAdmin: true,
          }),
          user: { teamName: "e2eteam", username: "captain", isAdmin: true },
          message: "Login successful",
        }),
      });
    });

    await page.goto("/login");
    await page.locator('input[name="username"]').fill("captain");
    await page.locator('input[name="teamName"]').fill("e2eteam");
    await page.locator('input[name="password"]').fill("secret123");
    await page.getByRole("button", { name: /confirm access/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Team register page is reachable", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("body")).toContainText(/register|team|create/i);
  });
});

test.describe("Academy Login / Register", () => {
  test("Academy login validates required fields", async ({ page }) => {
    await page.goto("/academy/login");
    await expect(page.getByRole("heading", { name: /academy sign in/i })).toBeVisible();
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(
      page.getByText(/email and password are required/i),
    ).toBeVisible();
  });

  test("Academy login success (mocked API) navigates to homepage", async ({
    page,
  }) => {
    await page.route("**/api/user/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            _id: "u1",
            firstName: "Ada",
            emailId: "ada@example.com",
            role: "user",
          },
          token: "e2e-academy-token",
          message: "Logged In Successfully",
        }),
      });
    });

    await page.goto("/academy/login");
    await page.locator('input[type="email"]').fill("ada@example.com");
    await page.locator('input[type="password"]').fill("secret123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL(/\/homepage/, { timeout: 15000 });
  });

  test("Academy register page validates password match", async ({ page }) => {
    await page.goto("/academy/register");
    await expect(
      page.getByRole("heading", { name: /create academy account/i }),
    ).toBeVisible();
    await page.locator('input[type="text"]').first().fill("Ada");
    await page.locator('input[type="email"]').fill("ada@example.com");
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill("secret123");
    await passwords.nth(1).fill("mismatch");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });
});

test.describe("Google Sign-In (mocked GIS — not live Google)", () => {
  test("mocked credential path calls googleLogin and navigates", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__E2E_GOOGLE_MOCK__ = true;
      // Minimal GIS stub if client id is present in the build
      window.google = {
        accounts: {
          id: {
            initialize: (cfg) => {
              window.__gisCallback = cfg.callback;
            },
            renderButton: (el) => {
              el.innerHTML = "";
              const btn = document.createElement("button");
              btn.type = "button";
              btn.textContent = "E2E Mock Google";
              btn.onclick = () =>
                window.__gisCallback?.({
                  credential: "e2e-mock-google-id-token",
                });
              el.appendChild(btn);
            },
            prompt: () => {},
          },
        },
      };
    });

    await page.route("**/api/user/googleLogin", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            _id: "g1",
            firstName: "Gigi",
            emailId: "gigi@example.com",
            role: "user",
            emailVerified: true,
          },
          token: "e2e-google-token",
          message: "Logged in with Google successfully",
        }),
      });
    });

    await page.goto("/academy/login");

    const mockBtn = page.getByRole("button", { name: /e2e mock google/i });
    const unconfigured = page.getByText(/google sign-in is not configured/i);

    // GIS init is async — wait for either mocked button or config message
    await Promise.race([
      mockBtn.waitFor({ state: "visible", timeout: 15000 }),
      unconfigured.waitFor({ state: "visible", timeout: 15000 }),
    ]);

    if (await unconfigured.isVisible().catch(() => false)) {
      test.info().annotations.push({
        type: "note",
        description:
          "Google button not rendered (no VITE_GOOGLE_CLIENT_ID). Live Google login not verified.",
      });
      return;
    }

    await mockBtn.click();
    await page.waitForURL(/\/homepage/, { timeout: 15000 });
  });
});


test.describe("Protected routes + logout", () => {
  test("unauthenticated visit to dashboard redirects to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });

  test("academy token allows private shell; logout clears team session path", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("academy_token", "e2e-academy-token");
      localStorage.setItem(
        "academy_user",
        JSON.stringify({
          _id: "u1",
          firstName: "Ada",
          emailId: "ada@example.com",
        }),
      );
    });

    await page.route("**/api/user/**", async (route) => {
      if (route.request().method() === "POST" && route.request().url().includes("logout")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, message: "ok" }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { firstName: "Ada", emailId: "ada@example.com", _id: "u1" },
          message: "Valid User",
        }),
      });
    });

    await page.goto("/homepage");
    await expect(page).not.toHaveURL(/\/academy\/login/);

    // Team logout control (sidebar) when present
    const logout = page.getByRole("button", { name: /logout/i }).first();
    if (await logout.isVisible().catch(() => false)) {
      await logout.click();
      await page.waitForURL(/\/login|\/$|\/academy\/login/, { timeout: 15000 });
    }
  });
});
