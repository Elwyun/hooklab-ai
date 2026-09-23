// ─────────────────────────────────────────────
// App-specific browser flows
//
// Everything that knows how this UI is shaped: how the brief form is labelled,
// how generation is triggered, and what the results look like. Shared by the
// screenshot script and the smoke test so the selectors live in one place and
// cannot drift apart.
// ─────────────────────────────────────────────
import { sleep } from "./browser.mjs";

export const SAMPLE_BRIEF = {
  productName: "Kopi Nusantara Premium",
  productDescription:
    "Kopi arabika single origin Gayo, dipanggang segar tiap minggu. Untuk penikmat kopi yang ingin rasa konsisten tanpa harus keluar rumah.",
  targetAudience: "Pekerja remote usia 25-35 tahun di kota besar",
};

export const WORKSPACE_READY = `!!document.querySelector('textarea')`;
export const PAGE_TEXT = `document.body.innerText`;
export const EMPTY_STATE_VISIBLE = `document.body.innerText.includes("Belum ada hook")`;
/**
 * Counts elements a user can actually see. The desktop and mobile layouts are
 * both in the DOM and toggled with CSS, so a plain querySelectorAll would count
 * every hook twice — and the invisible copy is not what a user experiences.
 */
export function visibleCountExpression(ariaLabel) {
  return `[...document.querySelectorAll('button[aria-label="${ariaLabel}"]')]
    .filter((el) => el.getClientRects().length > 0).length`;
}

export const HOOK_CARD_COUNT = visibleCountExpression("Copy hook text");
export const AUTH_MODAL_OPEN = `!!document.querySelector('input[type="email"]')`;
export const GENERATE_DISABLED = `[...document.querySelectorAll("button")].find((b) => b.textContent.includes("Generate Hook"))?.disabled ?? null`;

/**
 * Fills the brief form. Fields are located by their visible label rather than
 * by position, so a failure names the field that could not be found.
 *
 * React tracks controlled inputs, so the value is set through the native
 * prototype setter and announced with a bubbling `input` event — assigning
 * `el.value` directly would be silently ignored by React.
 */
export function fillBriefExpression(brief = SAMPLE_BRIEF) {
  return `(() => {
    const setValue = (el, value) => {
      const proto = el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const byLabel = (text) => {
      const label = [...document.querySelectorAll("label")].find((el) => el.textContent.includes(text));
      return label?.parentElement?.querySelector("input, textarea") ?? null;
    };

    const fields = {
      "Nama Produk": byLabel("Nama Produk"),
      "Deskripsi Produk": byLabel("Deskripsi Produk"),
      "Target Audiens": byLabel("Target Audiens"),
    };
    const missing = Object.entries(fields).filter(([, el]) => !el).map(([name]) => name);
    if (missing.length > 0) return "missing fields: " + missing.join(", ");

    setValue(fields["Nama Produk"], ${JSON.stringify(brief.productName)});
    setValue(fields["Deskripsi Produk"], ${JSON.stringify(brief.productDescription)});
    setValue(fields["Target Audiens"], ${JSON.stringify(brief.targetAudience)});
    return "ok";
  })()`;
}

const SUBMIT_EXPRESSION = `(() => {
  const button = [...document.querySelectorAll("button")].find((el) =>
    el.textContent.includes("Generate Hook")
  );
  if (!button) return "the Generate button was not found";
  if (button.disabled) return "the Generate button is still disabled";
  button.click();
  return "ok";
})()`;

const OPEN_AUTH_MODAL_EXPRESSION = `(() => {
  const button = [...document.querySelectorAll("button")].find((el) =>
    el.textContent.trim().includes("Login")
  );
  if (!button) return "the Login button was not found";
  button.click();
  return "ok";
})()`;

export async function fillBrief(session, brief = SAMPLE_BRIEF) {
  const outcome = await session.evaluate(fillBriefExpression(brief));
  if (outcome !== "ok") throw new Error(`could not fill the brief form — ${outcome}`);
}

export async function submitBrief(session) {
  const outcome = await session.evaluate(SUBMIT_EXPRESSION);
  if (outcome !== "ok") throw new Error(`could not start generation — ${outcome}`);
}

/** Fills the brief, generates, and waits for the hook cards to be rendered. */
export async function generateHooks(session, brief = SAMPLE_BRIEF) {
  await fillBrief(session, brief);
  await sleep(700); // let React commit the state update before clicking
  await submitBrief(session);
  await session.waitFor(`${HOOK_CARD_COUNT} > 0`, "the generated hooks");
  return session.evaluate(HOOK_CARD_COUNT);
}

export async function openAuthModal(session) {
  const outcome = await session.evaluate(OPEN_AUTH_MODAL_EXPRESSION);
  if (outcome !== "ok") throw new Error(`could not open the auth modal — ${outcome}`);
  await session.waitFor(AUTH_MODAL_OPEN, "the auth modal");
}
