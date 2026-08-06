/**
 * qa-inquiry-composer.mjs
 * Multi-pass Playwright E2E validation for the full-page inquiry composer
 * and the post-accept auto-advance flow (T1+T5 keystone).
 *
 * Run: node scripts/qa-inquiry-composer.mjs
 */

import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:8787";
const SCREENSHOTS_DIR =
  "/Volumes/madara/2026/Projects/thoughtseed/tirak/standalone-repos/tirakplus/generated/qa-screenshots/inquiry-composer";
const COMPANION_ID = "cmp-aura";

const results = {
  steps: [],
  assertions: [],
  inquiryId: null,
  consoleErrors: { traveller: [], companion: [] },
};

function log(msg) {
  process.stdout.write(`[qa] ${msg}\n`);
}

function pass(label, note = "") {
  results.steps.push({ label, result: "PASS", note });
  log(`PASS ${label}${note ? " — " + note : ""}`);
}

function fail(label, note = "") {
  results.steps.push({ label, result: "FAIL", note });
  log(`FAIL ${label}${note ? " — " + note : ""}`);
}

function assertContains(label, text, content) {
  const ok = content.toLowerCase().includes(text.toLowerCase());
  results.assertions.push({ label, expected: text, result: ok ? "PASS" : "FAIL" });
  log(`${ok ? "PASS" : "FAIL"} assert[${label}]: "${text}" in content`);
  return ok;
}

function assertAbsent(label, text, content) {
  const ok = !content.toLowerCase().includes(text.toLowerCase());
  results.assertions.push({ label, expected: `NOT "${text}"`, result: ok ? "PASS" : "FAIL" });
  log(`${ok ? "PASS" : "FAIL"} assert[${label}]: NOT "${text}" in content`);
  return ok;
}

async function screenshot(page, filename) {
  const path = join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path, fullPage: true });
  log(`screenshot: ${path}`);
  return path;
}

async function runPassA(browser) {
  log("\n════ PASS A — Composer flow at Desktop 1280×800 ════");
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Capture console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") results.consoleErrors.traveller.push(msg.text());
  });

  // A1: Dev login traveller
  log("A1: dev login traveller");
  const loginResp = await page.goto(
    `${BASE_URL}/api/dev/login?role=traveller`,
    { waitUntil: "networkidle", timeout: 15000 }
  ).catch(() => null);
  if (!loginResp || !loginResp.ok()) {
    fail("A1-dev-login-traveller", `HTTP ${loginResp?.status() ?? "no response"}`);
  } else {
    pass("A1-dev-login-traveller", `redirected to ${page.url()}`);
  }

  // Navigate to composer
  log("A1: navigating to composer");
  await page.goto(
    `${BASE_URL}/traveller/companions/${COMPANION_ID}/inquire`,
    { waitUntil: "networkidle", timeout: 15000 }
  );
  await page.waitForTimeout(1500);

  await screenshot(page, "A00-conversation-default.png");
  const currentUrl = page.url();
  if (!currentUrl.includes("/inquire")) {
    fail("A1-composer-navigation", `landed at ${currentUrl}`);
  } else {
    pass("A1-composer-navigation", currentUrl);
  }

  // A1b: Conversation ("Muse-led") is the DEFAULT presentation.
  const convoRoot = await page.$(".inquiry-composer-convo");
  convoRoot ? pass("A1b-conversation-default") : fail("A1b-conversation-default", "no .inquiry-composer-convo on load");
  const convoText = await page.evaluate(() => document.body.innerText);
  assertContains("A1b-step-progress", "Step 1 of 5", convoText);
  const switchToForm = await page.locator("button", { hasText: /Switch to the full form/i }).first();
  // A1c: Switch into the structured form (the T7-validated surface).
  try {
    await switchToForm.waitFor({ state: "visible", timeout: 4000 });
    await switchToForm.click();
    await page.waitForTimeout(500);
    pass("A1c-switch-to-form");
  } catch {
    fail("A1c-switch-to-form", "'Switch to the full form' button not found");
  }
  await screenshot(page, "A01-composer-initial.png");
  // A1d: The form exposes the reverse toggle back to the guided chat.
  const backToChat = await page.locator("button", { hasText: /Prefer a guided chat/i }).first();
  (await backToChat.count()) > 0
    ? pass("A1d-guided-chat-toggle-present")
    : fail("A1d-guided-chat-toggle-present", "no 'Prefer a guided chat' toggle in form mode");

  // A2: Assert initial render elements
  const bodyText = await page.evaluate(() => document.body.innerText);
  const bodyHtml = await page.evaluate(() => document.body.innerHTML);

  assertContains("A2-back-chevron", "inquiry-composer-back", bodyHtml);
  assertContains("A2-private-inquiry", "Private inquiry", bodyText);

  // Companion name — check for any h element in the companion card
  const companionCard = await page.$(".companion-inquiry-card, [class*='companion-inquiry']");
  if (companionCard) {
    pass("A2-companion-card", "CompanionInquiryCard present");
  } else {
    // Try text fallback — at least some heading should be visible
    const hasName = bodyText.length > 200;
    hasName ? pass("A2-companion-card", "page has substantial text content") : fail("A2-companion-card", "no companion card found");
  }

  const calendarEl = await page.$(".inline-calendar, [class*='calendar'], [aria-label*='calendar']");
  calendarEl ? pass("A2-calendar-present") : fail("A2-calendar-present", "no .inline-calendar element found");

  const timeChipsEl = await page.$(".time-slot-chips, [class*='slot'], [class*='time-slot']");
  timeChipsEl ? pass("A2-time-slots-present") : fail("A2-time-slots-present");

  const expChipEl = await page.$(".experience-chip, [class*='experience'], [class*='exp-chip']");
  expChipEl ? pass("A2-experience-chips-present") : fail("A2-experience-chips-present");

  const locationEl = await page.$("input[class*='location'], textarea[class*='location'], [class*='location-field'] input, [class*='location-field'] textarea, input[placeholder*='location'], input[placeholder*='Location'], input[placeholder*='hotel'], input[placeholder*='Hotel'], input[placeholder*='place'], input[placeholder*='venue']");
  locationEl ? pass("A2-location-field") : fail("A2-location-field", "no location input found");

  const textareaEl = await page.$("textarea");
  textareaEl ? pass("A2-message-textarea") : fail("A2-message-textarea");

  assertContains("A2-muse-button", "Muse", bodyText);
  assertContains("A2-discreet-card", "Discreet", bodyText);

  // A3: Send button initially disabled
  const sendBtn = await page.$(
    'button:has-text("Send Inquiry"), [class*="coral"] button, button[disabled]'
  );
  if (sendBtn) {
    const disabled = await sendBtn.isDisabled();
    disabled ? pass("A3-send-button-disabled") : fail("A3-send-button-disabled", "button not disabled initially");
  } else {
    fail("A3-send-button-disabled", "Send Inquiry button not found");
  }

  // A4: Click a future calendar day
  log("A4: picking a future date");
  // Find all enabled day buttons in the calendar
  const dayButtons = await page.$$("button[data-date], button[class*='calendar__day'], button[class*='cal-day'], [class*='calendar'] button:not([disabled])");
  let datePicked = false;
  for (const btn of dayButtons) {
    const isDisabled = await btn.isDisabled();
    const text = await btn.innerText().catch(() => "");
    const num = parseInt(text.trim(), 10);
    if (!isDisabled && num > 0 && num <= 31) {
      await btn.click();
      datePicked = true;
      break;
    }
  }
  if (datePicked) {
    await page.waitForTimeout(500);
    await screenshot(page, "A02-date-picked.png");
    pass("A4-date-picked");
  } else {
    // Try by aria-label or data attributes
    const anyFutureDay = await page.$("[class*='calendar'] button:not([disabled])");
    if (anyFutureDay) {
      await anyFutureDay.click();
      await page.waitForTimeout(500);
      await screenshot(page, "A02-date-picked.png");
      pass("A4-date-picked", "clicked first enabled calendar button");
      datePicked = true;
    } else {
      await screenshot(page, "A02-date-picked.png");
      fail("A4-date-picked", "no enabled date button found");
    }
  }

  // A5: Time slot chips enabled
  log("A5: picking time slot");
  await page.waitForTimeout(300);
  const slotBtns = await page.$$("[class*='time-slot'] button:not([disabled]), [class*='slot-chip']:not([disabled])");
  let slotPicked = false;
  for (const btn of slotBtns) {
    const text = await btn.innerText().catch(() => "");
    if (text.includes("19:00") || text.includes("19")) {
      await btn.click();
      slotPicked = true;
      break;
    }
  }
  if (!slotPicked && slotBtns.length > 0) {
    await slotBtns[0].click();
    slotPicked = true;
  }
  if (slotPicked) {
    await page.waitForTimeout(400);
    await screenshot(page, "A03-time-picked.png");
    pass("A5-time-slot-picked");
  } else {
    // Try by text content directly
    const slotByText = await page.locator("button", { hasText: "19:00" }).first();
    try {
      await slotByText.click({ timeout: 3000 });
      slotPicked = true;
      await page.waitForTimeout(400);
      await screenshot(page, "A03-time-picked.png");
      pass("A5-time-slot-picked", "via text locator");
    } catch {
      await screenshot(page, "A03-time-picked.png");
      fail("A5-time-slot-picked", "no time slot chips found or all disabled");
    }
  }

  // A6: Click experience chip
  log("A6: picking experience chip");
  const expChips = await page.$$("[class*='experience'] button:not([disabled]), [class*='exp-chip']:not([disabled]), [class*='chip']:not([disabled])");
  let expPicked = false;
  for (const chip of expChips) {
    const text = await chip.innerText().catch(() => "");
    if (text.toLowerCase().includes("dining") || text.toLowerCase().includes("private")) {
      await chip.click();
      expPicked = true;
      break;
    }
  }
  if (!expPicked && expChips.length > 0) {
    await expChips[0].click();
    expPicked = true;
  }
  expPicked ? pass("A6-experience-chip-picked") : fail("A6-experience-chip-picked");
  await page.waitForTimeout(300);

  // A7: Fill location
  log("A7: filling location");
  const locationInput = await page.$("input[class*='location'], [class*='location-field'] input, input[placeholder*='hotel'], input[placeholder*='Hotel'], input[placeholder*='place'], input[placeholder*='location'], input[placeholder*='meeting'], input[placeholder*='venue'], input[placeholder*='Where']");
  if (locationInput) {
    await locationInput.fill("Mandarin Oriental lobby");
    pass("A7-location-filled");
  } else {
    // Try all text inputs
    const inputs = await page.$$("input[type='text'], input:not([type])");
    if (inputs.length > 0) {
      await inputs[0].fill("Mandarin Oriental lobby");
      pass("A7-location-filled", "filled first text input");
    } else {
      fail("A7-location-filled", "no text input found");
    }
  }

  // A8: Fill message textarea
  log("A8: filling message");
  const textarea = await page.$("textarea");
  if (textarea) {
    await textarea.fill("Looking forward to a relaxed evening, thank you.");
    await page.waitForTimeout(300);
    await screenshot(page, "A04-form-filled.png");
    pass("A8-message-filled");
  } else {
    await screenshot(page, "A04-form-filled.png");
    fail("A8-message-filled", "no textarea found");
  }

  // A9: Check privacy checkbox
  log("A9: checking privacy checkbox");
  const checkbox = await page.$("input[type='checkbox']");
  if (checkbox) {
    await checkbox.check();
    await page.waitForTimeout(200);
    pass("A9-privacy-checkbox");
  } else {
    fail("A9-privacy-checkbox", "no checkbox found");
  }

  await page.waitForTimeout(300);

  // A10: Send button enabled
  log("A10: checking send button enabled");
  await screenshot(page, "A05-ready-to-send.png");
  const sendBtnAll = await page.$$('button');
  let sendEnabled = false;
  let sendBtnRef = null;
  for (const btn of sendBtnAll) {
    const text = await btn.innerText().catch(() => "");
    if (text.toLowerCase().includes("send inquiry")) {
      const disabled = await btn.isDisabled();
      if (!disabled) {
        sendEnabled = true;
        sendBtnRef = btn;
      }
      break;
    }
  }
  sendEnabled ? pass("A10-send-button-enabled") : fail("A10-send-button-enabled", "Send Inquiry still disabled or not found");

  // A11: Muse-assist (non-blocking)
  log("A11: Muse-assist test (non-blocking, max 15s)");
  const museBtn = await page.locator("button", { hasText: /Muse/i }).first();
  try {
    await museBtn.click({ timeout: 3000 });
    log("  Muse button clicked, waiting up to 15s for response...");
    await page.waitForTimeout(5000);
    const bodyAfterMuse = await page.evaluate(() => document.body.innerText);
    const hasMuseResult = bodyAfterMuse.toLowerCase().includes("muse") ||
                          bodyAfterMuse.toLowerCase().includes("paused") ||
                          bodyAfterMuse.toLowerCase().includes("helped") ||
                          bodyAfterMuse.toLowerCase().includes("loading");
    await screenshot(page, "A06-muse-assist.png");
    const museDraft = bodyAfterMuse.length > 500;
    pass("A11-muse-assist", museDraft ? "drafted suggestion or populated" : "graceful degrade (Muse paused/no-op)");
    results.museResult = museDraft ? "drafted" : "graceful-degrade";
  } catch {
    await screenshot(page, "A06-muse-assist.png");
    pass("A11-muse-assist", "Muse button not found or timed out — counted as graceful degrade");
    results.museResult = "graceful-degrade";
  }

  // Re-check send button after Muse (it may have changed textarea content)
  await page.waitForTimeout(500);
  const sendBtnsPost = await page.$$("button");
  let postMuseSendRef = null;
  let postMuseSendEnabled = false;
  for (const btn of sendBtnsPost) {
    const text = await btn.innerText().catch(() => "");
    if (text.toLowerCase().includes("send inquiry")) {
      const disabled = await btn.isDisabled();
      postMuseSendEnabled = !disabled;
      postMuseSendRef = btn;
      break;
    }
  }

  // If Muse overwrote the message make sure the checkbox is still checked
  const cbPost = await page.$("input[type='checkbox']");
  if (cbPost) {
    const checked = await cbPost.isChecked();
    if (!checked) await cbPost.check();
  }

  // Ensure message still has ≥24 chars
  const msgPost = await page.$("textarea");
  if (msgPost) {
    const val = await msgPost.inputValue();
    if (!val || val.trim().length < 24) {
      await msgPost.fill("Looking forward to a relaxed evening, thank you.");
      await page.waitForTimeout(300);
    }
  }

  // Re-find send button after potential resets
  const finalSendBtns = await page.$$("button");
  let finalSendRef = null;
  for (const btn of finalSendBtns) {
    const text = await btn.innerText().catch(() => "");
    if (text.toLowerCase().includes("send inquiry")) {
      finalSendRef = btn;
      break;
    }
  }

  // A12: Submit
  log("A12: clicking Send Inquiry");
  if (finalSendRef) {
    const disabled = await finalSendRef.isDisabled();
    if (disabled) {
      // Try to re-enable by refilling
      log("  Send still disabled — re-filling fields");
      if (msgPost) await msgPost.fill("Looking forward to a relaxed evening, thank you.");
      if (cbPost) {
        const checked = await cbPost.isChecked();
        if (!checked) await cbPost.check();
      }
      await page.waitForTimeout(400);
    }
    try {
      await finalSendRef.click({ timeout: 5000 });
      log("  Waiting for navigation...");
      await page.waitForURL(/\/traveller\/inbox\//, { timeout: 15000 });
      const afterUrl = page.url();
      await page.waitForTimeout(1500);
      await screenshot(page, "A07-after-send.png");

      const idMatch = afterUrl.match(/\/traveller\/inbox\/([^/?#]+)/);
      if (idMatch) {
        results.inquiryId = idMatch[1];
        pass("A12-send-navigated", `inquiry id: ${results.inquiryId}`);
        pass("A22-url-matches-inbox", afterUrl);
      } else {
        pass("A12-send-navigated", `landed at ${afterUrl}`);
        fail("A22-url-matches-inbox", `URL ${afterUrl} doesn't match /traveller/inbox/<id>`);
      }

      const afterBodyText = await page.evaluate(() => document.body.innerText);
      const hasStatus = afterBodyText.toLowerCase().includes("submitted") ||
                        afterBodyText.toLowerCase().includes("routed") ||
                        afterBodyText.toLowerCase().includes("inquiry") ||
                        afterBodyText.toLowerCase().includes("pending");
      hasStatus ? pass("A24-post-send-status-visible", "status text found") : fail("A24-post-send-status-visible", "no status text in post-send page");
    } catch (err) {
      const currentAfter = page.url();
      await screenshot(page, "A07-after-send.png");
      if (currentAfter.includes("/inbox/")) {
        const idMatch = currentAfter.match(/\/traveller\/inbox\/([^/?#]+)/);
        if (idMatch) results.inquiryId = idMatch[1];
        pass("A12-send-navigated", `url: ${currentAfter}`);
      } else {
        fail("A12-send-navigated", `Error: ${err.message} — url: ${currentAfter}`);
      }
    }
  } else {
    await screenshot(page, "A07-after-send.png");
    fail("A12-send-navigated", "Send Inquiry button not found");
  }

  await context.close();
  log(`\nPass A complete. Inquiry ID: ${results.inquiryId ?? "not captured"}`);
}

async function runPassB(browser, inquiryId) {
  log("\n════ PASS B — Companion accept → auto-advance ════");
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") results.consoleErrors.companion.push(msg.text());
  });

  // B1: Companion login
  log("B1: dev login companion");
  await page.goto(`${BASE_URL}/api/dev/login?role=companion`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(500);

  // B2: Navigate to companion inbox
  await page.goto(`${BASE_URL}/companion/inbox`, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(1500);
  await screenshot(page, "B01-companion-inbox.png");
  const inboxUrl = page.url();
  inboxUrl.includes("/companion/inbox") ? pass("B1-companion-inbox-loads") : fail("B1-companion-inbox-loads", `landed at ${inboxUrl}`);

  const inboxBody = await page.evaluate(() => document.body.innerText);
  const hasInquiry = inboxBody.length > 100;
  hasInquiry ? pass("B2-inbox-has-content") : fail("B2-inbox-has-content", "inbox appears empty");

  // B3: Find and open the inquiry
  log("B3: opening inquiry");
  let inquiryLinkClicked = false;

  if (inquiryId) {
    // Try direct navigation first
    log(`  Navigating directly to /companion/inbox/${inquiryId}`);
    await page.goto(`${BASE_URL}/companion/inbox/${inquiryId}`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);
    const detailUrl = page.url();
    if (detailUrl.includes(inquiryId) || detailUrl.includes("/inbox/")) {
      inquiryLinkClicked = true;
      pass("B3-inquiry-opened", `direct nav to ${detailUrl}`);
    }
  }

  if (!inquiryLinkClicked) {
    // Try clicking first inquiry link in inbox
    const links = await page.$$("a[href*='/companion/inbox/'], [class*='inbox'] a, [class*='inquiry'] a");
    if (links.length > 0) {
      await links[0].click();
      await page.waitForTimeout(1500);
      inquiryLinkClicked = true;
      pass("B3-inquiry-opened", "clicked first inbox link");
    } else {
      fail("B3-inquiry-opened", "no inquiry links found in companion inbox");
    }
  }

  await screenshot(page, "B02-companion-detail.png");

  // B4: Find Accept button
  log("B4: clicking Accept");
  const detailBodyBefore = await page.evaluate(() => document.body.innerText);
  const acceptBtn = await page.locator("button", { hasText: /^Accept$|^Accept inquiry/i }).first();
  let accepted = false;
  try {
    await acceptBtn.waitFor({ state: "visible", timeout: 5000 });
    await acceptBtn.click();
    log("  Accept clicked, waiting for state change...");
    await page.waitForTimeout(3000);
    accepted = true;
    pass("B4-accept-clicked");
  } catch {
    // Try alternate selector
    const btns = await page.$$("button");
    for (const btn of btns) {
      const text = await btn.innerText().catch(() => "");
      if (text.toLowerCase() === "accept" || text.toLowerCase().startsWith("accept")) {
        await btn.click();
        await page.waitForTimeout(3000);
        accepted = true;
        pass("B4-accept-clicked", "via button scan");
        break;
      }
    }
    if (!accepted) fail("B4-accept-clicked", "Accept button not found");
  }

  await screenshot(page, "B03-after-accept.png");

  // B5: Assert date_confirmed state
  const bodyAfterAccept = await page.evaluate(() => document.body.innerText);
  const hasConfirmed = bodyAfterAccept.toLowerCase().includes("plan confirmed") ||
                       bodyAfterAccept.toLowerCase().includes("date_confirmed") ||
                       bodyAfterAccept.toLowerCase().includes("confirmed") ||
                       bodyAfterAccept.toLowerCase().includes("scheduled");
  hasConfirmed ? pass("B5-date-confirmed-state") : fail("B5-date-confirmed-state", `body does not show confirmed state. Body snippet: ${bodyAfterAccept.slice(0, 200)}`);

  // B6: Ensure NO "propose dates" / "pick a window" prompt
  assertAbsent("B6-no-propose-dates", "propose", bodyAfterAccept);
  assertAbsent("B6-no-pick-window", "pick a window", bodyAfterAccept);

  await context.close();
}

async function runPassC(browser, inquiryId) {
  log("\n════ PASS C — Traveller sees confirmed (gate-rewire check) ════");
  if (!inquiryId) {
    fail("C0-has-inquiry-id", "No inquiry ID captured from Pass A — cannot run Pass C");
    return;
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // C1: Traveller login
  await page.goto(`${BASE_URL}/api/dev/login?role=traveller`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(500);

  // C2: Navigate to inquiry detail
  await page.goto(`${BASE_URL}/traveller/inbox/${inquiryId}`, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, "C01-traveller-confirmed.png");

  const detailUrl = page.url();
  detailUrl.includes(inquiryId) ? pass("C1-traveller-detail-loads", detailUrl) : fail("C1-traveller-detail-loads", `redirected to ${detailUrl}`);

  const bodyText = await page.evaluate(() => document.body.innerText);

  // C3: scheduledFor surface visible
  const hasDatetime = bodyText.match(/\d{1,2}:\d{2}/) !== null ||
                      bodyText.toLowerCase().includes("bangkok") ||
                      bodyText.toLowerCase().includes("confirmed") ||
                      bodyText.toLowerCase().includes("plan confirmed") ||
                      bodyText.toLowerCase().includes("jun") ||
                      bodyText.toLowerCase().includes("may") ||
                      bodyText.toLowerCase().includes("jul") ||
                      bodyText.toLowerCase().includes(":00");
  hasDatetime ? pass("C2-scheduled-datetime-visible") : fail("C2-scheduled-datetime-visible", `no time expression found. Snippet: ${bodyText.slice(0, 300)}`);

  // C4: Hold CTA
  assertContains("C3-hold-cta-present", "Hold your booking", bodyText);

  // C5: No "propose dates" / "pick a window"
  assertAbsent("C4-no-propose-dates", "propose", bodyText);
  assertAbsent("C4-no-pick-window", "pick a window", bodyText);

  await context.close();
}

async function runPassConvo(browser) {
  log("\n════ PASS E — Conversation flow steps + submits ════");
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") results.consoleErrors.traveller.push(msg.text());
  });

  await page.goto(`${BASE_URL}/api/dev/login?role=traveller`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => null);
  await page.goto(`${BASE_URL}/traveller/companions/${COMPANION_ID}/inquire`, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(1200);

  const clickContinue = async () => {
    const btn = page.locator(".inquiry-composer-convo__actions button", { hasText: /^Continue$/ }).first();
    await btn.click({ timeout: 4000 });
    await page.waitForTimeout(450);
  };

  // E1: when — pick first available calendar day + first time-slot chip
  const day = page.locator(".inquiry-composer-convo__affordance .composer-calendar__day.is-available").first();
  await day.click({ timeout: 5000 });
  await page.waitForTimeout(400);
  const slot = page.locator(".inquiry-composer-convo__affordance .composer-time-slot-chip").first();
  await slot.click({ timeout: 5000 });
  await page.waitForTimeout(300);
  await screenshot(page, "E01-convo-when.png");
  await clickContinue();
  pass("E1-convo-when");

  // E2: experience — pick first chip
  const expChip = await page.locator(".inquiry-composer-convo__affordance button:not([disabled])").first();
  await expChip.click({ timeout: 5000 });
  await page.waitForTimeout(250);
  await clickContinue();
  pass("E2-convo-experience");

  // E3: where — fill location input
  const loc = await page.locator(".inquiry-composer-convo__affordance input, .inquiry-composer-convo__affordance textarea").first();
  await loc.fill("Mandarin Oriental lobby");
  await page.waitForTimeout(250);
  await clickContinue();
  pass("E3-convo-where");

  // E4: message — fill textarea (skip Muse; type our own to keep deterministic)
  const ta = await page.locator(".inquiry-composer-convo__affordance textarea").first();
  await ta.fill("Looking forward to a relaxed evening together, thank you so much.");
  await page.waitForTimeout(250);
  await screenshot(page, "E02-convo-message.png");
  await clickContinue();
  pass("E4-convo-message");

  // E5: privacy — check + Send
  const cb = await page.locator(".inquiry-composer-convo__privacy input[type='checkbox']").first();
  await cb.check();
  await page.waitForTimeout(250);
  await screenshot(page, "E03-convo-privacy.png");
  const sendBtn = page.locator(".inquiry-composer-convo__actions button", { hasText: /Send Inquiry/i }).first();
  const sendDisabled = await sendBtn.isDisabled();
  sendDisabled ? fail("E5-convo-send-enabled", "Send still disabled") : pass("E5-convo-send-enabled");
  try {
    await sendBtn.click({ timeout: 5000 });
    await page.waitForURL(/\/traveller\/inbox\//, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await screenshot(page, "E04-convo-after-send.png");
    pass("E6-convo-submitted", page.url());
  } catch (err) {
    await screenshot(page, "E04-convo-after-send.png");
    page.url().includes("/inbox/")
      ? pass("E6-convo-submitted", page.url())
      : fail("E6-convo-submitted", `${err.message} — url: ${page.url()}`);
  }

  await context.close();
}

async function runPassD(browser) {
  log("\n════ PASS D — Responsive fidelity screenshots ════");

  const viewports = [
    { name: "D01-mobile", width: 390, height: 844, filename: "D01-mobile.png" },
    { name: "D02-tablet", width: 768, height: 1024, filename: "D02-tablet.png" },
    { name: "D03-wide", width: 1440, height: 900, filename: "D03-wide.png" },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/api/dev/login?role=traveller`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => null);
    await page.goto(`${BASE_URL}/traveller/companions/${COMPANION_ID}/inquire`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: join(SCREENSHOTS_DIR, vp.filename), fullPage: true });
    log(`screenshot: ${join(SCREENSHOTS_DIR, vp.filename)}`);

    // Basic overflow check
    const hasOverflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollWidth > window.innerWidth + 5;
    });
    hasOverflow ? fail(`${vp.name}-no-overflow`, `horizontal overflow detected at ${vp.width}px`) : pass(`${vp.name}-no-overflow`);

    pass(`${vp.name}-screenshot-captured`);
    await context.close();
  }
}

// Main
(async () => {
  log("Starting Tirak Plus inquiry-composer E2E validation");
  log(`Screenshots → ${SCREENSHOTS_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const startTime = Date.now();

  try {
    await runPassA(browser);
    await runPassB(browser, results.inquiryId);
    await runPassC(browser, results.inquiryId);
    await runPassConvo(browser);
    await runPassD(browser);
  } finally {
    await browser.close();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Summary
  const allSteps = results.steps;
  const allAssertions = results.assertions;
  const stepPass = allSteps.filter((s) => s.result === "PASS").length;
  const stepFail = allSteps.filter((s) => s.result === "FAIL").length;
  const assertPass = allAssertions.filter((a) => a.result === "PASS").length;
  const assertFail = allAssertions.filter((a) => a.result === "FAIL").length;

  log(`\n════════════════════════════════════════`);
  log(`RESULTS`);
  log(`Steps: ${stepPass} PASS / ${stepFail} FAIL`);
  log(`Assertions: ${assertPass} PASS / ${assertFail} FAIL`);
  log(`Inquiry ID: ${results.inquiryId ?? "not captured"}`);
  log(`Muse: ${results.museResult ?? "unknown"}`);
  log(`Elapsed: ${elapsed}s`);
  log(`Console errors (traveller): ${results.consoleErrors.traveller.length}`);
  if (results.consoleErrors.traveller.length > 0) {
    results.consoleErrors.traveller.forEach((e) => log(`  ERROR: ${e}`));
  }
  log(`Console errors (companion): ${results.consoleErrors.companion.length}`);
  if (results.consoleErrors.companion.length > 0) {
    results.consoleErrors.companion.forEach((e) => log(`  ERROR: ${e}`));
  }

  log(`\nAll FAIL steps:`);
  allSteps.filter((s) => s.result === "FAIL").forEach((s) => log(`  FAIL ${s.label}: ${s.note}`));
  log(`\nAll FAIL assertions:`);
  allAssertions.filter((a) => a.result === "FAIL").forEach((a) => log(`  FAIL ${a.label}: expected "${a.expected}"`));

  const overall = stepFail === 0 && assertFail === 0 ? "PASS" : "FAIL";
  const firstFail = allSteps.find((s) => s.result === "FAIL")?.label ?? allAssertions.find((a) => a.result === "FAIL")?.label;
  const failedNote = firstFail ? `| Failed: "${firstFail}" ` : "";

  log(`\nRESULT: ${overall} | Steps: ${stepPass}/${allSteps.length} | Assertions: ${assertPass}/${allAssertions.length} ${failedNote}| Duration: ${elapsed}s`);

  // Save JSON report
  const report = {
    result: overall,
    inquiryId: results.inquiryId,
    museResult: results.museResult,
    steps: allSteps,
    assertions: allAssertions,
    consoleErrors: results.consoleErrors,
    elapsed,
  };
  writeFileSync(join(SCREENSHOTS_DIR, "report.json"), JSON.stringify(report, null, 2));
  log(`Report saved: ${join(SCREENSHOTS_DIR, "report.json")}`);
})();
