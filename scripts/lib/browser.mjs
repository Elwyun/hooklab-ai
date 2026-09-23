// ─────────────────────────────────────────────
// Browser harness
//
// Generic plumbing shared by the screenshot script and the smoke tests: a
// running app server, a headless Chrome, and a thin DevTools Protocol client.
// No app-specific knowledge lives here — see ./app.mjs for that.
//
// Dependency-free on purpose: it uses the global WebSocket that ships with
// Node 20.19+ / 22+, so nothing has to be installed to drive a real browser.
// ─────────────────────────────────────────────
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const APP_PORT = Number(process.env.APP_PORT ?? 3000);
export const BASE_URL = `http://localhost:${APP_PORT}`;

// Capture at 2x so images stay crisp when GitHub scales them down.
const SCALE = 2;
const DEVTOOLS_PORT = 9222 + (process.pid % 500);

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Chrome ──────────────────────────────────────────────────

export function chromeCandidates() {
  const localAppData = process.env.LOCALAPPDATA ?? "";
  return {
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
}

export function chromeAvailable() {
  const override = process.env.CHROME_PATH;
  if (override) return existsSync(override);
  return chromeCandidates().filter(Boolean).some((path) => existsSync(path));
}

export function findChrome() {
  const override = process.env.CHROME_PATH;
  if (override) return override;

  const found = chromeCandidates().filter(Boolean).find((path) => existsSync(path));
  if (!found) {
    throw new Error("Chrome not found — install Google Chrome or set CHROME_PATH");
  }
  return found;
}

export function killTree(child) {
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
  // A dedicated profile keeps automated runs away from the user's own browser
  // state. Chrome refuses to create it on some restricted drives, so the caller
  // retries without it.
  if (profileDir) flags.push(`--user-data-dir=${profileDir}`);

  const chrome = spawn(chromePath, [...flags, "about:blank"], { stdio: "ignore" });

  const started = Date.now();
  while (Date.now() - started < 25_000) {
    try {
      await devtools("/json/version");
      return chrome;
    } catch {
      await sleep(400);
    }
  }

  killTree(chrome);
  return null;
}

async function devtools(path, init) {
  const response = await fetch(`http://127.0.0.1:${DEVTOOLS_PORT}${path}`, init);
  return response.json();
}

// ─── App server ──────────────────────────────────────────────

export async function isAppUp() {
  try {
    const response = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Returns the dev-server child process, or null when a server was already
 * running (in which case the caller must not shut it down).
 */
export async function ensureAppServer({ quiet = false } = {}) {
  if (await isAppUp()) {
    if (!quiet) console.log(`• using the dev server already running on ${BASE_URL}`);
    return null;
  }

  if (!quiet) console.log(`• starting a dev server on ${BASE_URL}`);
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

// ─── DevTools Protocol client ────────────────────────────────

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
  let target = (await devtools("/json/list")).find((t) => t.type === "page");
  if (!target) {
    target = await devtools("/json/new?about:blank", { method: "PUT" });
  }
  if (!target?.webSocketDebuggerUrl) throw new Error("Chrome exposed no page target");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("could not open the CDP socket")), { once: true });
  });
  return createClient(ws);
}

// ─── Session ─────────────────────────────────────────────────

/**
 * Starts the app (if needed) plus a headless Chrome, and returns a small API
 * for driving the page. Always call `close()` — it shuts down the browser and
 * any dev server this session started.
 */
export async function createSession({ width = 1440, height = 950, mobile = false, quiet = false } = {}) {
  const chromePath = findChrome();
  const server = await ensureAppServer({ quiet });
  const profileDir = join(tmpdir(), `hooklab-browser-${process.pid}`);
  let chrome = null;

  try {
    chrome = await launchChrome(chromePath, profileDir);
    if (!chrome) {
      if (!quiet) console.log("• could not use a private Chrome profile, retrying without one");
      chrome = await launchChrome(chromePath, null);
    }
    if (!chrome) throw new Error(`Chrome never opened the DevTools port ${DEVTOOLS_PORT}`);

    const client = await connectToPage();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await setViewport(width, height, mobile);

    async function setViewport(w, h, isMobile) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: h,
        deviceScaleFactor: SCALE,
        mobile: isMobile,
      });
    }

    async function evaluate(expression) {
      const result = await client.send("Runtime.evaluate", { expression, returnByValue: true });
      if (result.exceptionDetails) {
        throw new Error(`page evaluation failed: ${result.exceptionDetails.text ?? "unknown error"}`);
      }
      return result.result.value;
    }

    async function waitFor(expression, label, timeout = 30000) {
      const started = Date.now();
      while (Date.now() - started < timeout) {
        if (await evaluate(expression)) return true;
        await sleep(300);
      }
      throw new Error(`timed out waiting for ${label}`);
    }

    return {
      baseUrl: BASE_URL,

      /** Navigates to a path and waits for the load event plus a settle delay. */
      async navigate(path = "/", { settleMs = 0 } = {}) {
        const loaded = client.waitEvent("Page.loadEventFired");
        await client.send("Page.navigate", { url: new URL(path, BASE_URL).toString() });
        await loaded;
        if (settleMs > 0) await sleep(settleMs);
      },

      setViewport,
      evaluate,
      waitFor,

      /** Runs an expression and fails loudly unless it equals `expected`. */
      async expect(expression, expected, label) {
        const actual = await evaluate(expression);
        if (actual !== expected) {
          throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
        return actual;
      },

      async screenshot(file) {
        const { data } = await client.send("Page.captureScreenshot", { format: "png" });
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, Buffer.from(data, "base64"));
        return file;
      },

      async close() {
        killTree(chrome);
        if (server) killTree(server);
        await sleep(1000); // Chrome's helpers need a moment to release the profile
        try {
          rmSync(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
        } catch {
          // A leftover temp profile is harmless.
        }
      },
    };
  } catch (error) {
    killTree(chrome);
    if (server) killTree(server);
    throw error;
  }
}
