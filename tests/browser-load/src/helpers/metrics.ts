import type { Page, Request } from '@playwright/test';
import { appForUrl } from '../config.js';

export interface RequestMetric { url: string; method: string; resourceType: string; status?: number; durationMs: number; failed?: string; bytes?: number; }
export interface NavigationMetric { url: string; app: string; durationMs: number; dnsMs: number; tcpMs: number; tlsMs: number; ttfbMs: number; domContentLoadedMs: number; loadMs: number; fcpMs?: number; lcpMs?: number; cls?: number; }
export interface RuntimeMetric { pageErrors: string[]; consoleErrors: string[]; failedRequests: RequestMetric[]; requests: RequestMetric[]; navigations: NavigationMetric[]; }
export function attachMetrics(page: Page, app: string, metric: RuntimeMetric): void {
  const starts = new WeakMap<Request, number>();
  page.on('request', (request) => starts.set(request, Date.now()));
  page.on('requestfailed', (request) => metric.failedRequests.push({ url: request.url(), method: request.method(), resourceType: request.resourceType(), durationMs: Date.now() - (starts.get(request) ?? Date.now()), failed: request.failure()?.errorText }));
  page.on('response', (response) => {
    const request = response.request();
    metric.requests.push({ url: request.url(), method: request.method(), resourceType: request.resourceType(), status: response.status(), durationMs: Math.max(0, Date.now() - (starts.get(request) ?? Date.now())), bytes: Number(response.headers()['content-length'] ?? 0) });
  });
  page.on('load', () => {
    const url = page.url();
    void page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const paints = performance.getEntriesByType('paint');
      const lcp = (performance as Performance & { __lcp?: number }).__lcp;
      const cls = (performance as Performance & { __cls?: number }).__cls;
      if (!nav) return null;
      return { dnsMs: nav.domainLookupEnd - nav.domainLookupStart, tcpMs: nav.connectEnd - nav.connectStart, tlsMs: nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0, ttfbMs: nav.responseStart - nav.requestStart, domContentLoadedMs: nav.domContentLoadedEventEnd, loadMs: nav.loadEventEnd, fcpMs: paints.find((entry) => entry.name === 'first-contentful-paint')?.startTime, lcpMs: lcp, cls };
    }).then((nav) => { if (nav) metric.navigations.push({ url, app: appForUrl(url) ?? app, durationMs: nav.loadMs, ...nav }); }).catch(() => undefined);
  });
  page.on('pageerror', (error) => metric.pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') metric.consoleErrors.push(message.text()); });
  page.on('crash', () => metric.pageErrors.push('Page crashed'));
  void page.addInitScript(() => {
    try {
      new PerformanceObserver((list) => { const e = list.getEntries().at(-1); if (e) (performance as Performance & { __lcp?: number }).__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => { for (const e of list.getEntries() as Array<PerformanceEntry & { hadRecentInput: boolean; value: number }>) if (!e.hadRecentInput) (performance as Performance & { __cls?: number }).__cls = ((performance as Performance & { __cls?: number }).__cls ?? 0) + e.value; }).observe({ type: 'layout-shift', buffered: true });
    } catch { /* browser does not expose observer */ }
  });
}
