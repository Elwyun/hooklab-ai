#!/usr/bin/env node
// ─────────────────────────────────────────────
// README screenshot generator
//
//   npm run screenshots
//   CHROME_PATH=/path/to/chrome npm run screenshots
//   APP_PORT=3001 npm run screenshots
//
// If nothing is listening on the app port, a dev server is started for the
// duration of the capture and shut down afterwards. All PNGs are written by
// this process rather than by Chrome, which also makes it work on drives Chrome
// is not allowed to write to.
// ─────────────────────────────────────────────
import { statSync } from "node:fs";

import { generateHooks, openAuthModal, WORKSPACE_READY } from "./lib/app.mjs";
import { chromeAvailable, createSession, sleep } from "./lib/browser.mjs";

const OUT_DIR = "docs/screenshots";

async function capture(session, name) {
  const file = await session.screenshot(`${OUT_DIR}/${name}.png`);
  console.log(`  ✓ ${file} (${Math.round(statSync(file).size / 1024)} KB)`);
}

async function main() {
  if (!chromeAvailable()) {
    throw new Error("Chrome not found — install Google Chrome or set CHROME_PATH");
  }

  const session = await createSession();

  try {
    console.log("• desktop — generator workspace");
    await session.setViewport(1440, 950, false);
    await session.navigate("/", { settleMs: 2500 });
    await session.waitFor(WORKSPACE_READY, "the generator workspace");
    await generateHooks(session);
    await sleep(600); // let the last transition settle so the capture is stable
    await capture(session, "generator-workspace");

    console.log("• desktop — auth modal");
    await openAuthModal(session);
    await sleep(900);
    await capture(session, "auth-modal");

    console.log("• mobile — linear flow");
    await session.setViewport(390, 844, true);
    await session.navigate("/", { settleMs: 2500 });
    await generateHooks(session);
    await session.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    await sleep(1500);
    await capture(session, "mobile-flow");

    console.log(`✓ screenshots refreshed in ${OUT_DIR}/`);
  } finally {
    await session.close();
  }
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
