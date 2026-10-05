import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const reportDir = resolve(root, 'tests/browser-load/reports');
const publicDir = resolve(root, 'apps/pyreport/public/reports');
const readJson = async <T>(path: string): Promise<T | undefined> => {
  try { return JSON.parse(await readFile(path, 'utf8')) as T; } catch { return undefined; }
};
const latestLoad = await readJson<Record<string, unknown>>(resolve(reportDir, 'latest.json'));
const e2e = await readJson<{ stats?: { expected?: number; unexpected?: number; skipped?: number; flaky?: number }; suites?: unknown[] }>(resolve(reportDir, 'playwright-results.json'));
const summaryFile = await readJson<Record<string, unknown>>(resolve(reportDir, 'summary.json'));
const isLoadRun = process.env.PYREPORT_KIND === 'load' && Boolean(latestLoad?.runId);
const currentRunId = isLoadRun ? String(latestLoad?.runId) : `e2e-${new Date().toISOString().replaceAll(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const now = new Date().toISOString();
const summary = isLoadRun
  ? { ...summaryFile, runId: currentRunId, kind: 'load', timestamp: latestLoad?.timestamp ?? now, target: latestLoad?.target, users: latestLoad?.users, durationSeconds: latestLoad?.durationSeconds, pagesVisited: latestLoad?.pagesVisited, successfulSessions: latestLoad?.successfulSessions, failedSessions: latestLoad?.failedSessions, errorRate: latestLoad?.errorRate, navigation: latestLoad?.navigation }
  : { runId: currentRunId, kind: 'e2e', timestamp: now, passed: e2e?.stats?.expected ?? 0, failed: e2e?.stats?.unexpected ?? 0, skipped: e2e?.stats?.skipped ?? 0, flaky: e2e?.stats?.flaky ?? 0 };
let archiveId = currentRunId;
const existingSummary = await readJson<{ kind?: string }>(resolve(publicDir, 'runs', archiveId, 'summary.json'));
if (existingSummary && existingSummary.kind !== (isLoadRun ? 'load' : 'e2e')) archiveId = `${currentRunId}-${isLoadRun ? 'load' : 'e2e'}`;
const runDir = resolve(publicDir, 'runs', archiveId);
const archivedSummary = { ...summary, archiveId };
await mkdir(runDir, { recursive: true });
for (const filename of isLoadRun ? ['latest.json', 'summary.json', 'metrics.json', 'routes.json'] : ['playwright-results.json']) {
  try { await cp(resolve(reportDir, filename), resolve(runDir, filename)); } catch { /* artifact wasn't produced by this run */ }
}
if (!isLoadRun) {
  try {
    await cp(resolve(reportDir, 'playwright'), resolve(runDir, 'playwright'), { recursive: true });
    await cp(resolve(reportDir, 'playwright'), resolve(publicDir, 'playwright'), { recursive: true, force: true });
  } catch { /* reporter may be disabled */ }
}
await writeFile(resolve(runDir, 'summary.json'), `${JSON.stringify(archivedSummary, null, 2)}\n`);
const dataDir = resolve(publicDir, 'data');
await mkdir(dataDir, { recursive: true });
const priorLatest = await readJson<{ timestamp?: string }>(resolve(dataDir, 'latest.json'));
const isNewestRun = !priorLatest?.timestamp || new Date(String(summary.timestamp)).getTime() >= new Date(priorLatest.timestamp).getTime();
const publicLatest = isLoadRun ? { ...latestLoad, kind: 'load' } : summary;
if (isNewestRun) {
  await writeFile(resolve(dataDir, 'latest.json'), `${JSON.stringify(publicLatest, null, 2)}\n`);
  await writeFile(resolve(publicDir, 'summary.json'), `${JSON.stringify(archivedSummary, null, 2)}\n`);
}
if (isLoadRun && isNewestRun) {
  for (const filename of ['metrics.json', 'routes.json']) {
    try { await cp(resolve(reportDir, filename), resolve(publicDir, filename)); } catch { /* optional */ }
  }
}
const runEntries = await readdir(resolve(publicDir, 'runs'), { withFileTypes: true }).catch(() => []);
const runs = (await Promise.all(runEntries.filter((entry) => entry.isDirectory()).map(async (entry) => {
  const data = await readJson<Record<string, unknown>>(resolve(publicDir, 'runs', entry.name, 'summary.json'));
  return data ? { ...data, ...(data.kind === 'e2e' ? { reportUrl: `/reports/runs/${encodeURIComponent(entry.name)}/playwright/index.html` } : {}) } : undefined;
}))).filter((item): item is Record<string, unknown> => Boolean(item)).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
const existing = runs.some((run) => run.archiveId === archiveId);
if (!existing) runs.unshift({ ...archivedSummary, ...(summary.kind === 'e2e' ? { reportUrl: `/reports/runs/${encodeURIComponent(archiveId)}/playwright/index.html` } : {}) });
await writeFile(resolve(publicDir, 'runs.json'), `${JSON.stringify(runs, null, 2)}\n`);
console.info(`[pyreport] archived ${summary.kind} run ${currentRunId} → apps/pyreport/public/reports${isNewestRun ? ' (latest)' : ''}`);
