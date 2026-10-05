import type { Browser, BrowserContext, Page } from '@playwright/test';
import { appForUrl, bases, behavior, type AppName, type RouteDefinition } from '../config.js';
import { attachMetrics, type RuntimeMetric } from '../helpers/metrics.js';
import { choose, random, wait } from '../helpers/random.js';

export interface SessionResult { userId: number; success: boolean; pages: string[]; durationMs: number; error?: string; metric: RuntimeMetric; }
const blankMetric = (): RuntimeMetric => ({ pageErrors: [], consoleErrors: [], failedRequests: [], requests: [], navigations: [] });
export async function runJourney(browser: Browser, userId: number, routes: RouteDefinition[], seed: number): Promise<SessionResult> {
  const rand = random(seed + userId * 7919); const metric = blankMetric(); const visited: string[] = []; const started = Date.now();
  let context: BrowserContext | undefined;
  try {
    context = await browser.newContext({ viewport: { width: 1365, height: 768 }, locale: 'en-US', timezoneId: 'Asia/Kolkata', colorScheme: rand() > 0.5 ? 'light' : 'dark' });
    const page = await context.newPage();
    let currentApp = choose(['portfolio', 'docs', 'blogs'] as AppName[], rand);
    let currentUrl = bases[currentApp];
    attachMetrics(page, currentApp, metric);
    const steps = Math.min(behavior.maxPagesPerSession, Math.max(behavior.minPagesPerSession, 3 + Math.floor(rand() * 6)));
    for (let index = 0; index < steps; index++) {
      const response = await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      if (!response || response.status() >= 400) throw new Error(`Navigation failed (${response?.status() ?? 'no response'}): ${currentUrl}`);
      await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 }); visited.push(page.url());
      if (rand() < behavior.scrollProbability) {
        await page.evaluate(async () => { window.scrollTo({ top: Math.min(document.body.scrollHeight, window.innerHeight * 0.75), behavior: 'smooth' }); });
        await wait(250 + rand() * 600);
      }
      await wait(behavior.minThinkTimeMs + rand() * (behavior.maxThinkTimeMs - behavior.minThinkTimeMs));
      if (visited.length > 1 && rand() < behavior.backProbability) {
        const fallback = visited[Math.max(0, visited.length - 2)]!;
        const response = await page.goBack({ waitUntil: 'domcontentloaded', timeout: 10_000 }).catch(() => null);
        currentUrl = response ? page.url() : fallback;
        continue;
      }
      const links = await page.locator('a[href]').evaluateAll((anchors, allowedHosts) => anchors.map((anchor) => {
        try { const url = new URL((anchor as HTMLAnchorElement).href); return allowedHosts.includes(url.host) && ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
      }).filter((href): href is string => Boolean(href)), [...new Set(routes.map((route) => new URL(route.url).host))]);
      const candidates = links.filter((href) => href !== page.url() && routes.some((route) => route.url.replace(/\/$/, '') === href.replace(/\/$/, '')));
      if (candidates.length && rand() < behavior.clickProbability) { currentUrl = choose(candidates, rand); currentApp = appForUrl(currentUrl) ?? currentApp; }
      else { const sameApp = routes.filter((route) => route.app === currentApp && route.url !== page.url()); if (sameApp.length) currentUrl = choose(sameApp, rand).url; }
    }
    return { userId, success: true, pages: visited, durationMs: Date.now() - started, metric };
  } catch (error) { return { userId, success: false, pages: visited, durationMs: Date.now() - started, error: String(error), metric }; }
  finally { await context?.close().catch(() => undefined); }
}
