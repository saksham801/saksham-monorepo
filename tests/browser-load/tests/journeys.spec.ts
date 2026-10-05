import { test, expect } from '@playwright/test';
import { chromium } from '@playwright/test';
import { discoverRoutes } from '../src/routes.js';
import { runJourney } from '../src/journeys/index.js';
import { seed } from '../src/config.js';

test('virtual user completes a realistic, bounded journey', async () => {
  const browser = await chromium.launch();
  try {
    const routes = await discoverRoutes(true);
    const session = await runJourney(browser, 1, routes, seed);
    expect(session.pages.length).toBeGreaterThan(0);
    expect(session.durationMs).toBeGreaterThan(0);
  } finally { await browser.close(); }
});
