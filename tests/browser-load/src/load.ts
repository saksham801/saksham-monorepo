import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bases, isProduction, limits, productionAllowed, runId, seed, thresholds } from './config.js';
import { runJourney, type SessionResult } from './journeys/index.js';
import { discoverRoutes } from './routes.js';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const output = resolve(root, 'tests/browser-load/reports');
const users = limits.users;
const durationSeconds = Number(process.env.DURATION ?? limits.duration);
if (!Number.isInteger(users) || users < 1 || users > limits.maxUsers) throw new Error(`USERS must be 1-${limits.maxUsers}; got ${users}. Override MAX_USERS deliberately to raise the safety ceiling.`);
if (durationSeconds < 1 || durationSeconds > limits.maxDuration) throw new Error(`DURATION must be 1-${limits.maxDuration} seconds; got ${durationSeconds}.`);
if (isProduction && !productionAllowed) throw new Error('Refusing production load: set ALLOW_PRODUCTION_LOAD_TEST=true explicitly (and ensure you are authorized).');
if (limits.maxRequests < 1) throw new Error('MAX_REQUESTS must be positive.');
const allowlist = (process.env.TARGET_ALLOWLIST ?? '').split(',').map((x) => x.trim()).filter(Boolean);
for (const base of Object.values(bases)) {
  const host = new URL(base).host;
  if (allowlist.length && !allowlist.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) throw new Error(`Target ${host} is not in TARGET_ALLOWLIST.`);
}
const routes = await discoverRoutes(true);
if (!routes.length) throw new Error('Route discovery found no routes. Check configured URLs and source tree.');
console.info(`[${runId}] discovered ${routes.length} routes; target ${users} users for ${durationSeconds}s (seed ${seed})`);
const browser = await chromium.launch({ headless: true });
const startedAt = new Date(); const sessions: SessionResult[] = []; let active = 0; let stop = false; let requests = 0;
const endAt = Date.now() + durationSeconds * 1000;
const runner = async (userId: number) => {
  active++;
  const rampDownMs = Math.min(limits.rampDownSeconds * 1000, durationSeconds * 1000);
  const userStopAt = endAt - rampDownMs + rampDownMs * userId / users;
  try {
    while (!stop && Date.now() < userStopAt && requests < limits.maxRequests) {
      const result = await runJourney(browser, userId, routes, seed + sessions.length);
      sessions.push(result); requests += result.metric.requests.length + result.metric.failedRequests.length;
      if (requests >= limits.maxRequests) stop = true;
    }
  } finally { active--; }
};
const workers = Array.from({ length: users }, (_, i) => async () => runner(i + 1));
let running: Promise<void>[] = [];
try {
  // Stagger initial starts over the configured ramp period, while capping concurrency at USERS.
  const rampMs = Math.min(limits.rampUpSeconds * 1000, durationSeconds * 1000);
  const initialUsers = Math.min(users, Math.max(1, limits.initialUsers));
  running = workers.map(async (start, i) => {
    if (i >= initialUsers) {
      const rampSlots = Math.max(1, users - initialUsers);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, rampMs * (i - initialUsers + 1) / rampSlots));
    }
    await start();
  });
  await Promise.all(running);
} finally { stop = true; await Promise.allSettled(running); await browser.close(); }
const navs = sessions.flatMap((s) => s.metric.navigations);
const percentile = (values: number[], p: number) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)] : null; };
const durations = navs.map((n) => n.durationMs);
const allRequests = sessions.flatMap((s) => [...s.metric.requests, ...s.metric.failedRequests]);
const pages = sessions.flatMap((s) => s.pages);
const errorCount = sessions.filter((s) => !s.success).length;
const report = {
  runId, timestamp: startedAt.toISOString(), commitSha: (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); } catch { return 'unknown'; } })(),
  environment: process.env.NODE_ENV ?? 'local-run', target: process.env.TARGET ?? 'production', bases, users, durationSeconds, seed,
  browser: `Chromium ${browser.version()}`, playwrightVersion: '1.63.0', bunVersion: process.versions.bun ?? 'unknown',
  pagesVisited: pages.length, successfulSessions: sessions.filter((s) => s.success).length, failedSessions: errorCount,
  errorRate: sessions.length ? errorCount / sessions.length : 0, requests: allRequests.length, activeUsersAtFinish: active,
  navigation: { p50: percentile(durations, .5), p75: percentile(durations, .75), p95: percentile(durations, .95), p99: percentile(durations, .99), max: durations.length ? Math.max(...durations) : null },
  routeGroups: Object.fromEntries([...new Set(routes.map((r) => r.app))].map((app) => [app, Object.fromEntries(routes.filter((r) => r.app === app).map((r) => { const matching = navs.filter((n) => new URL(n.url).pathname === r.path && r.app === n.app); return [r.path, { requests: matching.length, successRate: matching.length ? 1 : null, p50: percentile(matching.map((x) => x.durationMs), .5), p75: percentile(matching.map((x) => x.durationMs), .75), p95: percentile(matching.map((x) => x.durationMs), .95), p99: percentile(matching.map((x) => x.durationMs), .99), max: matching.length ? Math.max(...matching.map((x) => x.durationMs)) : null, errors: 0 }]; }))])),
  failedSessionDetails: sessions.filter((s) => !s.success).map((s) => ({ userId: s.userId, error: s.error, pages: s.pages })),
  brokenRoutes: allRequests.filter((r) => r.status === 404 || r.status === 410 || (r.status ?? 0) >= 500).map((r) => ({ url: r.url, status: r.status })),
  slowRoutes: [...routes].map((r) => ({ app: r.app, path: r.path, p95: percentile(navs.filter((n) => new URL(n.url).pathname === r.path && n.app === r.app).map((n) => n.durationMs), .95) })).filter((r) => r.p95 !== null).sort((a, b) => b.p95! - a.p95!).slice(0, 10),
  browserErrors: sessions.flatMap((s) => [...s.metric.pageErrors.map((message) => ({ severity: 'critical', message })), ...s.metric.consoleErrors.map((message) => ({ severity: 'warning', message }))]),
  network: { failedRequests: sessions.flatMap((s) => s.metric.failedRequests), requestMetrics: allRequests, statusDistribution: Object.fromEntries([...new Set(allRequests.map((r) => r.status ?? 0))].map((status) => [status, allRequests.filter((r) => (r.status ?? 0) === status).length])) },
  thresholds: { ...thresholds }, routes,
};
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(output, 'summary.json'), `${JSON.stringify({ runId, users, durationSeconds, pagesVisited: pages.length, successfulSessions: report.successfulSessions, failedSessions: errorCount, errorRate: report.errorRate, navigation: report.navigation, slowRoutes: report.slowRoutes, brokenRoutes: report.brokenRoutes }, null, 2)}\n`);
await writeFile(resolve(output, 'metrics.json'), `${JSON.stringify({ runId, routes: report.routeGroups, navigation: navs, requests: allRequests, browserErrors: report.browserErrors }, null, 2)}\n`);
process.env.PYREPORT_KIND = 'load';
await import('./publish.js');
console.info(`completed: ${report.successfulSessions}/${sessions.length} sessions; ${pages.length} page visits; reports: ${output}`);
if (errorCount / Math.max(1, sessions.length) * 100 > thresholds.errorRatePercent) process.exitCode = 1;
