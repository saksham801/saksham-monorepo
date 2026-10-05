import { test, expect } from '@playwright/test';
import { bases } from '../src/config.js';
import { discoverRoutes } from '../src/routes.js';

test('all configured application homepages respond', async ({ browser }) => {
  for (const [app, url] of Object.entries(bases)) {
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 });
    expect(response?.status(), `${app} homepage: ${url}`).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
    await page.close();
  }
});

test('discovered public routes are reachable', async ({ browser }) => {
  const routes = await discoverRoutes(true);
  expect(routes.length).toBeGreaterThan(0);
  for (const route of routes.slice(0, Number(process.env.SMOKE_ROUTE_LIMIT ?? 30))) {
    const page = await browser.newPage();
    const response = await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 20_000 }).catch(() => null);
    expect(response?.status(), `${route.app} ${route.path}`).toBeLessThan(400);
    await page.close();
  }
});
