import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import { routeGroups, originFor } from '../config/routes.js';
import { choose, integer } from '../utils/random.js';
import { browserErrors, navigationDuration, readingDuration, scrollDuration } from '../utils/metrics.js';

export const options = {
  scenarios: { browser_users: { executor: 'constant-vus', vus: Number(__ENV.TARGET_VUS || 1), duration: __ENV.TEST_DURATION || '1m', options: { browser: { type: 'chromium' } } } },
  thresholds: { browser_web_vital_lcp: [`p(95)<${__ENV.LCP_THRESHOLD || '4000'}`] },
};

export default async function () {
  const app = choose(['portfolio', 'blogs', 'docs']);
  const candidates = routeGroups[app].filter((item) => ['homepage', 'listing', 'blog', 'docs'].includes(item.type));
  const first = candidates.find((item) => item.type === 'homepage') || candidates[0];
  const target = candidates.filter((item) => item.type === (app === 'blogs' ? 'blog' : app === 'docs' ? 'docs' : 'homepage'));
  const chosen = target.length ? choose(target) : first;
  const mobile = Math.random() < 0.3;
  const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  page.on('pageerror', () => browserErrors.add(1, { app, device: mobile ? 'mobile' : 'desktop' }));
  try {
    for (const item of [first, chosen]) {
      const start = Date.now();
      const response = await page.goto(`${originFor(app)}${item.path}`, { waitUntil: 'domcontentloaded' });
      navigationDuration.add(Date.now() - start, { route: item.path, app, device: mobile ? 'mobile' : 'desktop', page_type: item.type });
      const loaded = check(response, { 'browser page loaded': (res) => res && res.status() < 400 });
      if (!loaded) browserErrors.add(1, { route: item.path, app });
      const dwell = integer(item.type === 'blog' || item.type === 'docs' ? 5 : 2, item.type === 'blog' || item.type === 'docs' ? 15 : 6);
      const started = Date.now();
      await page.evaluate(async (seconds) => {
        const steps = 3;
        for (let i = 1; i <= steps; i++) {
          window.scrollTo({ top: document.documentElement.scrollHeight * i / steps, behavior: 'smooth' });
          await new Promise((resolve) => setTimeout(resolve, seconds * 1000 / steps));
        }
        if (Math.random() < 0.25) window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
      }, dwell);
      readingDuration.add(Date.now() - started, { route: item.path, app, persona: 'browser', device: mobile ? 'mobile' : 'desktop' });
      scrollDuration.add(Date.now() - started, { route: item.path, app, device: mobile ? 'mobile' : 'desktop' });
      sleep(integer(1, 3));
    }
  } catch (error) {
    browserErrors.add(1, { app, device: mobile ? 'mobile' : 'desktop' });
    console.error(`Browser journey failed for ${app}: ${error}`);
  } finally {
    await page.close();
  }
}

export function handleSummary(data) {
  const metrics = data.metrics;
  const summary = {
    test_type: 'browser', base_url: __ENV.BASE_URL, ended_at: new Date().toISOString(),
    seed: Number(__ENV.SEED || 12345), peak_vus: metrics.vus_max?.values?.max || null,
    total_requests: metrics.http_reqs?.values?.count || 0,
    request_rate_per_second: metrics.http_reqs?.values?.rate || 0,
    average_latency_ms: metrics.http_req_duration?.values?.avg ?? null,
    p50_ms: metrics.http_req_duration?.values?.['p(50)'] ?? null,
    p95_ms: metrics.http_req_duration?.values?.['p(95)'] ?? null,
    p99_ms: metrics.http_req_duration?.values?.['p(99)'] ?? null,
    error_rate: metrics.http_req_failed?.values?.rate || 0,
    browser_errors: metrics.browser_errors?.values?.count || 0,
    raw_metrics: metrics,
    assessment: (metrics.browser_errors?.values?.count || 0) > 0 ? 'WARNING' : 'PASS',
  };
  return { 'tests/performance/results/latest.json': JSON.stringify(summary, null, 2), stdout: `Browser test ${summary.assessment}: ${summary.total_requests} requests, ${summary.browser_errors} browser errors\\n` };
}
