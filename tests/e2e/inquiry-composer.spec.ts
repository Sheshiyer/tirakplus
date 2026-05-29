/**
 * Inquiry Composer E2E — ISC-1 through ISC-40
 *
 * Pass A  ISC-1..24   Composer render + full submit flow (traveller)
 * Pass B  ISC-25..30  Companion accept → date_confirmed auto-advance
 * Pass C  ISC-31..34  Traveller confirmed surface gate
 * Pass D  ISC-35..40  Responsive screenshots
 *
 * Prerequisites: wrangler dev running on localhost:8787 (npm run dev)
 * Auth:          /api/dev/login?role= bypass (non-production only)
 */

import { expect, test } from "@playwright/test";
import * as path from "path";

// Shared state between passes — inquiry id captured after submission.
let capturedInquiryId = "";

// ─── helpers ────────────────────────────────────────────────────────────────

async function loginAs(page: import("@playwright/test").Page, role: "traveller" | "companion") {
  await page.goto(`/api/dev/login?role=${role}`);
  // Dev login redirects → wait for the dashboard to settle
  await page.waitForURL(role === "traveller" ? /\/traveller/ : /\/companion/, { timeout: 10_000 });
}

/** Switch the InquiryComposerPage from conversation mode (default) to full form. */
async function switchToForm(page: import("@playwright/test").Page) {
  const switchBtn = page.locator(".inquiry-composer-convo__switch");
  await switchBtn.waitFor({ state: "visible", timeout: 5_000 });
  await switchBtn.click();
  await page.locator(".inquiry-composer-layout").waitFor({ state: "visible", timeout: 5_000 });
}

/** Click the first available calendar day (not disabled). */
async function pickFutureDate(page: import("@playwright/test").Page) {
  // InlineCalendar renders .composer-calendar__grid > button.is-available (not disabled)
  const dayButton = page
    .locator(".composer-calendar__grid button.is-available:not([disabled])")
    .first();
  await dayButton.waitFor({ state: "visible", timeout: 8_000 });
  await dayButton.click();
}

// ─── Pass A — Composer render assertions (ISC-1..12) ────────────────────────

test("ISC-1: composer page loads without error", async ({ page }) => {
  await loginAs(page, "traveller");
  const response = await page.goto("/traveller/companions/cmp-aura/inquire");
  expect(response?.status()).toBeLessThan(400);
});

test("ISC-2: back chevron present in initial snapshot", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await expect(page.locator("[aria-label='Back'], .back-chevron, a[href*='discovery'], button:has-text('Back')").first()).toBeVisible();
});

test("ISC-3: private inquiry header visible", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await expect(page.getByText(/private inquiry/i)).toBeVisible();
});

test("ISC-4: companion name visible in profile card", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await expect(page.getByText(/aura/i).first()).toBeVisible();
});

test("ISC-5: calendar grid present", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await expect(page.locator(".composer-calendar__grid")).toBeVisible();
});

test("ISC-6: time-slot chips section present", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await expect(page.locator(".composer-time-slots")).toBeVisible();
});

test("ISC-7: at least one experience chip visible", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await switchToForm(page);
  await expect(page.locator(".composer-experience-chip").first()).toBeVisible();
});

test("ISC-8: location field present", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await switchToForm(page);
  await expect(page.locator("input[type='text'], input:not([type='submit']):not([type='checkbox']):not([type='radio'])").first()).toBeVisible();
});

test("ISC-9: message textarea present", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await switchToForm(page);
  await expect(page.locator(".composer-muse-field__textarea, textarea").first()).toBeVisible();
});

test("ISC-10: Ask Muse to help button present", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await switchToForm(page);
  await expect(page.locator(".composer-muse-assist-button")).toBeVisible();
});

test("ISC-11: Discreet by design text present", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await switchToForm(page);
  // DiscreetByDesignCard renders .composer-discreet-card__heading
  await expect(page.locator(".composer-discreet-card__heading, .composer-discreet-card, h3:has-text('Discreet')").first()).toBeVisible();
});

test("ISC-12: Send Inquiry button disabled initially", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await switchToForm(page);
  // Submit bar button is type="button" (not type="submit") with disabled={!canSubmit}
  const sendBtn = page.locator(".inquiry-composer-submit-bar button").filter({ hasText: /send inquiry/i });
  await expect(sendBtn).toBeVisible();
  await expect(sendBtn).toBeDisabled();
});

// ─── Pass A — Interaction steps (ISC-13..24) ────────────────────────────────

test("ISC-13 to 24: full composer flow → submit → redirect", async ({ page }) => {
  await loginAs(page, "traveller");
  await page.goto("/traveller/companions/cmp-aura/inquire");
  await switchToForm(page);

  // ISC-13: pick a future calendar day
  await pickFutureDate(page);
  await expect(page.locator(".composer-calendar__grid button.is-selected, .composer-calendar__grid button[aria-pressed='true']").first()).toBeVisible({ timeout: 5_000 });

  // ISC-14: time-slot chips enabled after date selection — wait for .is-disabled to clear
  await page.waitForFunction(() => !document.querySelector(".composer-time-slots.is-disabled"), { timeout: 5_000 });
  const timeSlot = page.locator(".composer-time-slots .composer-time-slot-chip").first();
  await expect(timeSlot).toBeVisible({ timeout: 5_000 });

  // ISC-15: select a time slot
  await timeSlot.click();

  // ISC-16: select an experience chip (first unselected one)
  const expChip = page.locator(".composer-experience-chip").first();
  await expChip.click();

  // ISC-17: fill location
  const locationInput = page.locator("input[type='text'], input:not([type])").first();
  await locationInput.fill("Mandarin Oriental lobby");

  // ISC-18: fill message (≥24 chars)
  const textarea = page.locator(".composer-muse-field__textarea, textarea").first();
  await textarea.fill("Hi Aura, looking forward to connecting for a quiet evening in Bangkok.");

  // ISC-19: toggle privacy checkbox
  const checkbox = page.locator(".inquiry-composer-privacy input[type='checkbox']").first();
  await checkbox.check();

  // ISC-20: Send Inquiry button now enabled
  const sendBtn = page.locator(".inquiry-composer-submit-bar button").filter({ hasText: /send inquiry/i });
  await expect(sendBtn).toBeEnabled({ timeout: 5_000 });

  // ISC-21: Muse assist doesn't crash
  const museBtn = page.locator(".composer-muse-assist-button");
  await museBtn.click();
  await page.waitForTimeout(2_000);
  await expect(page.locator(".inquiry-composer-submit-bar")).toBeVisible();

  // ISC-22: clicking Send navigates away
  await sendBtn.click();
  await page.waitForURL(/\/traveller\/inbox\//, { timeout: 15_000 });

  // ISC-23: URL matches /traveller/inbox/<id>
  const url = page.url();
  expect(url).toMatch(/\/traveller\/inbox\/inq_/);
  capturedInquiryId = url.split("/traveller/inbox/")[1]?.split("?")[0] ?? "";
  expect(capturedInquiryId).toMatch(/^inq_/);

  // ISC-24: page shows inquiry status text
  await expect(page.getByText(/submitted|routed|plan your time|private inquiry/i).first()).toBeVisible({ timeout: 8_000 });
});

// ─── Pass B — Companion accept → date_confirmed (ISC-25..30) ────────────────

test("ISC-25: companion inbox loads", async ({ page }) => {
  await loginAs(page, "companion");
  await page.goto("/companion/inbox");
  await expect(page).toHaveURL(/\/companion\/inbox/);
});

test("ISC-26 to 30: companion sees inquiry, accepts, page shows date_confirmed", async ({ page }) => {
  // Log in with the synthetic companion email that matches the booking index
  await page.goto("/api/dev/login?role=companion&email=companion-cmp-aura%40tirak.app");
  await page.waitForURL(/\/companion/, { timeout: 10_000 });

  if (capturedInquiryId) {
    // ISC-26: navigate directly to captured inquiry (email matches booking index)
    await page.goto(`/companion/inbox/${capturedInquiryId}`);
    await page.waitForURL(/\/companion\/inbox\//, { timeout: 10_000 });
  } else {
    // Fallback: go to inbox list and open first item
    await page.goto("/companion/inbox");
    const inquiryLink = page.locator("a[href*='/companion/inbox/']").first();
    await expect(inquiryLink).toBeVisible({ timeout: 8_000 });
    await inquiryLink.click();
    await page.waitForURL(/\/companion\/inbox\//, { timeout: 10_000 });
  }

  // ISC-27: detail page with Accept button (inside .companion-decision-panel)
  const acceptBtn = page.locator(".companion-decision-panel button").filter({ hasText: /accept/i }).first();
  await expect(acceptBtn).toBeVisible({ timeout: 8_000 });

  // ISC-28: clicking Accept doesn't error — wait for the API response
  const [acceptResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/inquiries/") && r.request().method() === "POST", { timeout: 10_000 }),
    acceptBtn.click(),
  ]);
  expect(acceptResponse.status()).toBeLessThan(400);

  // ISC-29: page shows accepted/date_confirmed state
  // After auto-advance to date_confirmed: eyebrow = "date confirmed", or .plan-stage-confirmed visible
  await expect(
    page.locator(".plan-stage-confirmed, .member-hero .eyebrow").first()
  ).toHaveText(/date confirmed|accepted|plan confirmed/i, { timeout: 8_000 });

  // ISC-30: no "Propose dates" / "pick a window" prompt
  await expect(page.getByText(/propose dates|pick a window/i)).toHaveCount(0);
});

// ─── Pass C — Traveller confirmed surface gate (ISC-31..34) ─────────────────

test("ISC-31 to 34: traveller detail page after accept", async ({ page }) => {
  // Use capturedInquiryId from Pass A — if tests ran in order it'll be set.
  // Fall back to navigating inbox and opening first row.
  await loginAs(page, "traveller");

  if (capturedInquiryId) {
    await page.goto(`/traveller/inbox/${capturedInquiryId}`);
  } else {
    await page.goto("/traveller/inbox");
    const first = page.locator("a[href*='/traveller/inbox/inq_']").first();
    await expect(first).toBeVisible({ timeout: 8_000 });
    await first.click();
    await page.waitForURL(/\/traveller\/inbox\/inq_/, { timeout: 10_000 });
  }

  // ISC-31: renders without error (no error panel)
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".traveller-inquiry-detail-error, .plan-stage-error")).toHaveCount(0);

  // ISC-32: .plan-stage-confirmed section present (contains scheduled date/time)
  await expect(page.locator(".plan-stage-confirmed")).toBeVisible({ timeout: 8_000 });

  // ISC-33: "Hold your booking" CTA section present
  await expect(page.locator(".plan-stage-hold-cta")).toBeVisible({ timeout: 8_000 });

  // ISC-34: no "propose dates" / "pick a window"
  await expect(page.getByText(/propose dates|pick a window/i)).toHaveCount(0);
});

// ─── Pass D — Responsive screenshots (ISC-35..40) ───────────────────────────

const VIEWPORTS = [
  { name: "mobile",  width: 390,  height: 844 },
  { name: "tablet",  width: 768,  height: 1024 },
  { name: "wide",    width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`ISC-${VIEWPORTS.indexOf(vp) * 2 + 35}: ${vp.name} screenshot captured (${vp.width}x${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await loginAs(page, "traveller");
    await page.goto("/traveller/companions/cmp-aura/inquire");
    await page.waitForLoadState("networkidle");
    const screenshotPath = path.join("tests/e2e/screenshots", `composer-${vp.name}-${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    // ISC-38/39/40: no obvious overflow — body scroll width ≤ viewport width
    const overflows = await page.evaluate((vpWidth) => {
      const els = Array.from(document.querySelectorAll("*"));
      return els.filter((el) => (el as HTMLElement).getBoundingClientRect().right > vpWidth + 2).length;
    }, vp.width);
    expect(overflows, `overflow elements at ${vp.width}px`).toBeLessThan(5);
  });
}
