// ─────────────────────────────────────────────
// Smoke tests
//
//   npm test
//
// Two layers, both driving the real app over the same harness the screenshot
// script uses:
//   • the generation endpoint is exercised over HTTP,
//   • the generate-hook flow is exercised through a real headless Chrome.
//
// The browser suite needs Chrome; it is skipped with a message when none is
// installed. Everything else runs with Node alone.
// ─────────────────────────────────────────────
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import {
  EMPTY_STATE_VISIBLE,
  fillBrief,
  fillBriefExpression,
  GENERATE_DISABLED,
  generateHooks,
  HOOK_CARD_COUNT,
  openAuthModal,
  PAGE_TEXT,
  SAMPLE_BRIEF,
  visibleCountExpression,
  WORKSPACE_READY,
} from "../scripts/lib/app.mjs";
import { BASE_URL, chromeAvailable, createSession, ensureAppServer, killTree, sleep } from "../scripts/lib/browser.mjs";

const BRIEF_PAYLOAD = { ...SAMPLE_BRIEF, tone: "professional", platform: "meta", duration: "15s" };

function postBrief(body) {
  return fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// One app server for the whole run. When a dev server is already listening it
// is reused and left alone; otherwise this run owns it and stops it at the end.
let appServer = null;

before(async () => {
  appServer = await ensureAppServer({ quiet: true });
}, { timeout: 300_000 });

after(() => {
  if (appServer) killTree(appServer);
});

// ─── The generation endpoint ─────────────────────────────────

describe("POST /api/generate", () => {
  it("returns hooks for a complete brief", async () => {
    const response = await postBrief(BRIEF_PAYLOAD);
    assert.equal(response.status, 200);

    const { hooks } = await response.json();
    assert.ok(Array.isArray(hooks), "the response should carry a hooks array");
    assert.equal(hooks.length, 3);

    for (const hook of hooks) {
      assert.equal(typeof hook.id, "string", "every hook needs an id");
      assert.ok(
        hook.text.includes(SAMPLE_BRIEF.productName),
        `the hook should be built from the submitted product name: ${hook.text}`
      );
      assert.ok(["Easy", "Medium", "Hard"].includes(hook.readability));
      assert.equal(hook.isFavorite, false);
    }
  });

  it("feeds the target audience into the hooks", async () => {
    const response = await postBrief(BRIEF_PAYLOAD);
    const { hooks } = await response.json();

    assert.ok(
      hooks.some((hook) => hook.text.includes(SAMPLE_BRIEF.targetAudience)),
      "at least one hook should address the submitted audience"
    );
  });

  it("rejects an incomplete brief", async () => {
    const response = await postBrief({ productName: "Hanya Nama" });
    assert.equal(response.status, 400);

    const body = await response.json();
    assert.match(body.error, /required/i, `unexpected error message: ${body.error}`);
  });
});

// ─── The generate-hook flow, in a real browser ───────────────

describe("generator UI", { skip: chromeAvailable() ? false : "Chrome not found — install Google Chrome or set CHROME_PATH" }, () => {
  let session = null;

  before(async () => {
    session = await createSession({ quiet: true });
  }, { timeout: 300_000 });

  after(async () => {
    await session?.close();
  });

  /** Every test starts from a cold page so they stay order independent. */
  async function openWorkspace() {
    await session.navigate("/", { settleMs: 2500 });
    await session.waitFor(WORKSPACE_READY, "the generator workspace");
  }

  it("renders the workspace in its empty state", { timeout: 120_000 }, async () => {
    await openWorkspace();

    const text = await session.evaluate(PAGE_TEXT);
    assert.match(text, /HookLab/, "the navbar should show the brand");
    assert.match(text, /Input Panel/, "the brief form should render");
    assert.match(text, /Target Audiens/, "the brief form should be complete");

    assert.equal(await session.evaluate(EMPTY_STATE_VISIBLE), true, "the gallery should invite a first generation");
    assert.equal(await session.evaluate(HOOK_CARD_COUNT), 0, "no hooks before generating");
  });

  it("keeps Generate disabled until the brief is complete", { timeout: 120_000 }, async () => {
    await openWorkspace();
    assert.equal(await session.evaluate(GENERATE_DISABLED), true, "Generate should start disabled");

    // Only the description missing — the button must stay locked.
    const partial = fillBriefExpression({ ...SAMPLE_BRIEF, productDescription: "" });
    assert.equal(await session.evaluate(partial), "ok");
    await sleep(600);
    assert.equal(await session.evaluate(GENERATE_DISABLED), true, "a description should still be required");

    await fillBrief(session);
    await sleep(600);
    assert.equal(await session.evaluate(GENERATE_DISABLED), false, "Generate should unlock once the brief is complete");
  });

  it("generates hooks from the submitted brief", { timeout: 120_000 }, async () => {
    await openWorkspace();

    const count = await generateHooks(session);
    assert.equal(count, 3, "the fallback generator returns three hooks");

    const text = await session.evaluate(PAGE_TEXT);
    assert.ok(text.includes(SAMPLE_BRIEF.productName), "the hooks should mention the product name");
    assert.ok(text.includes(SAMPLE_BRIEF.targetAudience), "the hooks should use the target audience");
    assert.match(text, /Generated Hooks/, "the output gallery should render its results");
    assert.match(text, /Professional/, "the selected tone should reach the generator");
    assert.match(text, /3 hasil/, "the gallery should report how many hooks it holds");

    assert.equal(
      await session.evaluate(visibleCountExpression("Save hook")),
      3,
      "each hook should be bookmarkable"
    );
    assert.equal(
      await session.evaluate(visibleCountExpression("Remix hook")),
      3,
      "each hook should be remixable"
    );
  });

  it("opens the auth modal from the navbar", { timeout: 120_000 }, async () => {
    await openWorkspace();
    await openAuthModal(session);

    const text = await session.evaluate(PAGE_TEXT);
    assert.match(text, /Welcome Back/, "the modal should open on the login tab");
    assert.match(text, /Register/, "the modal should offer registration too");
  });
});
