#!/usr/bin/env node
// ─────────────────────────────────────────────
// README screenshot generator
//
// Drives the locally installed Chrome through the DevTools Protocol to capture
// the screenshots embedded in README.md. Intentionally dependency-free: it only
// uses the global WebSocket that ships with Node 20.19+ / 22+.
//
//   npm run screenshots
//   CHROME_PATH=/path/to/chrome npm run screenshots
//   APP_PORT=3001 npm run screenshots
//
// If nothing is listening on the app port, a dev server is started for the
// duration of the capture and shut down afterwards. Chrome writes nothing to
// disk itself — every PNG is written by this script from the base64 payload
// returned by the DevTools Protocol, which also makes it work on drives Chrome
// is not allowed to write to.
// ─────────────────────────────────────────────
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP_PORT = Number(process.env.APP_PORT ?? 3000);
const BASE_URL = `http://localhost:${APP_PORT}`;
const OUT_DIR = "docs/screenshots";
const DEVTOOLS_PORT = 9222 + (process.pid % 500);
const SCALE = 2; // capture at 2x so the images stay crisp when GitHub scales them

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Chrome discovery ────────────────────────────────────────

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const localAppData = process.env.LOCALAPPDATA ?? "";
  const candidates = {
    win32: [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      localAppData && join(localAppData, "Google\\Chrome\\Application\\chrome.exe"),
    ],
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ],
    linux: [
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ],
  }[process.platform] ?? [];

  const found = candidates.filter(Boolean).find((path) => existsSync(path));
  if (!found) {
    throw new Error("Chrome not found — install Google Chrome or set CHROME_PATH");
  }
  return found;
}

// ─── Minimal DevTools Protocol client ────────────────────────

function createClient(ws) {
  let seq = 0;
  const pending = new Map();
  const waiters = new Set();

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== undefined && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method) for (const waiter of [...waiters]) waiter(message);
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const waitEvent = (method, timeout = 30000) =>
    new Promise((resolve, reject) => {
      const listener = (message) => {
        if (message.method !== method) return;
        clearTimeout(timer);
        waiters.delete(listener);
        resolve(message.params);
      };
      const timer = setTimeout(() => {
        waiters.delete(listener);
        reject(new Error(`timed out waiting for ${method}`));
      }, timeout);
      waiters.add(listener);
    });

  return { send, waitEvent };
}

async function connectToPage() {
  let target = (await getJson("/json/list")).find((t) => t.type === "page");
  if (!target) {
    target = await getJson("/json/new?about:blank", { method: "PUT" });
  }
  if (!target?.webSocketDebuggerUrl) {
    throw new Error("Chrome exposed no page target");
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("could not open the CDP socket")), { once: true });
  });
  return createClient(ws);
}

async function getJson(path, init) {
  const response = await fetch(`http://127.0.0.1:${DEVTOOLS_PORT}${path}`, init);
  return response.json();
}

// ─── Page helpers ────────────────────────────────────────────

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, returnByValue: true });
  if (result.exceptionDetails) {
    throw new Error(`page evaluation failed: ${result.exceptionDetails.text ?? "unknown error"}`);
  }
  return result.result.value;
}

async function waitUntil(client, expression, label, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(client, expression)) return;
    await sleep(300);
  }
  throw new Error(`timed out waiting for ${label}`);
}

async function setViewport(client, width, height, mobile) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: SCALE,
    mobile,
  });
}

async function openApp(client) {
  const loaded = client.waitEvent("Page.loadEventFired");
  await client.send("Page.navigate", { url: BASE_URL });
  await loaded;
  await waitUntil(client, `!!document.querySelector("textarea")`, "the app markup");
  await sleep(2500); // give React time to hydrate before touching the form
}

async function capture(client, name) {
  const { data } = await client.send("Page.captureScreenshot", { format: "png" });
  const file = `${OUT_DIR}/${name}.png`;
  writeFileSync(file, Buffer.from(data, "base64"));
  console.log(`  ✓ ${file} (${Math.round(statSync(file).size / 1024)} KB)`);
}

// ─── The screen content ──────────────────────────────────────

const SAMPLE_BRIEF = {
  productName: "Kopi Nusantara Premium",
  productDescription:
    "Kopi arabika single origin Gayo, dipanggang segar tiap minggu. Untuk penikmat kopi yang ingin rasa konsisten tanpa harus keluar rumah.",
  targetAudience: "Pekerja remote usia 25-35 tahun di kota besar",
};

// Fields are located by their visible label rather than by index, so the script
// reports exactly what broke if the form ever changes.
const FILL_FORM = `(() => {
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
    name: byLabel("Nama Produk"),
    description: byLabel("Deskripsi Produk"),
    audience: byLabel("Target Audiens"),
  };
  const missing = Object.entries(fields).filter(([, el]) => !el).map(([key]) => key);
  if (missing.length > 0) return "missing fields: " + missing.join(", ");

  setValue(fields.name, ${JSON.stringify(SAMPLE_BRIEF.productName)});
  setValue(fields.description, ${JSON.stringify(SAMPLE_BRIEF.productDescription)});
  setValue(fields.audience, ${JSON.stringify(SAMPLE_BRIEF.targetAudience)});
  return "ok";
})()`;

const CLICK_GENERATE = `(() => {
  const button = [...document.querySelectorAll("button")].find((el) =>
    el.textContent.includes("Generate Hook")
  );
  if (!button) return "generate button not found";
  if (button.disabled) return "generate button is still disabled";
  button.click();
  return "ok";
})()`;

const CLICK_LOGIN = `(() => {
  const button = [...document.querySelectorAll("button")].find((el) =>
    el.textContent.trim().includes("Login")
  );
  if (!button) return "login button not found";
  button.click();
  return "ok";
})()`;

const RENDERED_HOOKS = `document.querySelectorAll('button[aria-label="Copy hook text"]').length`;
const AUTH_MODAL_OPEN = `!!document.querySelector('input[type="email"]')`;

async function requireStep(client, expression, expectation, label) {
  const outcome = await evaluate(client, expression);
  if (outcome !== expectation) throw new Error(`${label}: ${outcome}`);
}

async function generateHooks(client) {
  await requireStep(client, FILL_FORM, "ok", "could not fill the brief form");
  await sleep(700); // let React commit the state update
  await requireStep(client, CLICK_GENERATE, "ok", "could not start generation");
  await waitUntil(client, `${RENDERED_HOOKS} > 0`, "the generated hooks");
  await sleep(600);
}

// ─── Processes ───────────────────────────────────────────────

async function isAppUp() {
  try {
    const response = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

function killTree(child) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    // Deliberately synchronous: a fire-and-forget taskkill is cut short when the
    // script exits right after, which would leave the dev server (and Chrome)
    // running in the background.
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  try {
    child.kill("SIGTERM");
  } catch {
    // already gone
  }
}

async function ensureAppServer() {
  if (await isAppUp()) {
    console.log(`• using the dev server already running on ${BASE_URL}`);
    return null;
  }

  console.log(`• starting a dev server on ${BASE_URL}`);
  const server = spawn("npm", ["run", "dev", "--", "--port", String(APP_PORT)], {
    shell: true, // npm is a .cmd shim on Windows
    stdio: "ignore",
  });

  const started = Date.now();
  while (Date.now() - started < 180_000) {
    if (await isAppUp()) return server;
    await sleep(1000);
  }
  killTree(server);
  throw new Error(`the dev server never answered on ${BASE_URL}`);
}

async function launchChrome(chromePath, profileDir) {
  const flags = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--remote-debugging-port=${DEVTOOLS_PORT}`,
  ];
  // A dedicated profile keeps the capture away from the user's own browser
  // state. Chrome refuses to create it on some restricted drives, so the
  // caller retries without it.
  if (profileDir) flags.push(`--user-data-dir=${profileDir}`);

  const chrome = spawn(chromePath, [...flags, "about:blank"], { stdio: "ignore" });

  const started = Date.now();
  while (Date.now() - started < 25_000) {
    try {
      await getJson("/json/version");
      return chrome;
    } catch {
      await sleep(400);
    }
  }

  killTree(chrome);
  return null;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const chromePath = findChrome();
  console.log(`• chrome: ${chromePath}`);

  const server = await ensureAppServer();
  const profileDir = join(tmpdir(), `hooklab-screenshots-${process.pid}`);
  let chrome = null;

  try {
    chrome = await launchChrome(chromePath, profileDir);
    if (!chrome) {
      console.log("• could not use a private Chrome profile, retrying without one");
      chrome = await launchChrome(chromePath, null);
    }
    if (!chrome) throw new Error(`Chrome never opened the DevTools port ${DEVTOOLS_PORT}`);

    const client = await connectToPage();
    await client.send("Page.enable");
    await client.send("Runtime.enable");

    console.log("• desktop — generator workspace");
    await setViewport(client, 1440, 950, false);
    await openApp(client);
    await generateHooks(client);
    await capture(client, "generator-workspace");

    console.log("• desktop — auth modal");
    await requireStep(client, CLICK_LOGIN, "ok", "could not open the auth modal");
    await waitUntil(client, AUTH_MODAL_OPEN, "the auth modal");
    await sleep(900);
    await capture(client, "auth-modal");

    console.log("• mobile — linear flow");
    await setViewport(client, 390, 844, true);
    await openApp(client);
    await generateHooks(client);
    await evaluate(client, "window.scrollTo(0, document.body.scrollHeight)");
    await sleep(1500);
    await capture(client, "mobile-flow");

    console.log(`✓ screenshots refreshed in ${OUT_DIR}/`);
  } finally {
    killTree(chrome);
    if (server) killTree(server);
    await sleep(1000); // Chrome's helper processes need a moment to release the profile
    try {
      rmSync(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    } catch {
      // A leftover temp profile is harmless — never fail a finished capture over it.
    }
  }
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
