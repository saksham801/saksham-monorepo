import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const server = createServer((request, response) => {
  const status = request.url === '/' ? 500 : 200;
  response.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' });
  response.end(`<main><h1>Test route</h1><a href="/blogs/">Articles</a><p>${request.url}</p></main>`);
});
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
const output = mkdtempSync(join(tmpdir(), 'k6-runtime-check-'));
mkdirSync(join(output, 'tests/performance/results'), { recursive: true });
const target = `http://127.0.0.1:${address.port}`;
const env = {
  ...process.env,
  BASE_URL: target,
  BLOGS_URL: target,
  DOCS_URL: target,
  TEST_TYPE: 'smoke',
  TEST_DURATION: '10s',
    THINK_TIME_SCALE: '0.01',
  TARGET_VUS: '1',
  MAX_VUS: '1',
  RAMP_DURATION: '1s',
  SEED: '12345',
  ERROR_RATE_THRESHOLD: '1',
  P95_THRESHOLD: '60000',
  P99_THRESHOLD: '60000',
};
const k6 = spawn('k6', ['run', resolve('tests/performance/main.js')], { cwd: output, env, stdio: 'inherit' });
const status = await new Promise((resolveExit) => k6.on('close', resolveExit));
server.close();
try {
  const report = JSON.parse(readFileSync(join(output, 'tests/performance/results/latest.json'), 'utf8'));
  console.log(JSON.stringify({ requests: report.total_requests, journeys: report.journeys_started, journeys_completed: report.journeys_completed, visited_routes: report.routes_tested, coverage_percent: report.route_coverage_percent, injected_5xx_detected: report.status_5xx > 0, report_generated: true }, null, 2));
  if (!report.total_requests || !report.journeys_started || !report.journeys_completed || !report.routes_tested || !report.status_5xx || !report.routes.some((route) => route.errors > 0)) process.exitCode = 1;
} catch (error) {
  console.error(`Runtime smoke did not produce a useful report: ${error}`);
  process.exitCode = 1;
} finally {
  rmSync(output, { recursive: true, force: true });
}
if (status !== 0) process.exitCode = 1;
