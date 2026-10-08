import { spawnSync } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const profile = process.argv[2] || 'smoke';
const profiles = ['smoke', 'load', 'stress', 'spike', 'soak', 'browser', 'breakpoint'];
if (!profiles.includes(profile)) throw new Error(`Unknown profile '${profile}'. Choose: ${profiles.join(', ')}`);
if (!process.env.BASE_URL) throw new Error('Set BASE_URL explicitly, e.g. BASE_URL=http://127.0.0.1:4321');
const target = new URL(process.env.BASE_URL);
if (!['http:', 'https:'].includes(target.protocol)) throw new Error('BASE_URL must use http or https');
if (profile === 'browser') {
  process.env.K6_BROWSER_ENABLED = 'true';
  process.env.TEST_TYPE = 'browser';
} else process.env.TEST_TYPE = profile;
try { process.env.GIT_COMMIT ||= execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { process.env.GIT_COMMIT ||= 'unknown'; }
try { process.env.K6_VERSION ||= execFileSync('k6', ['version'], { encoding: 'utf8' }).trim(); } catch { process.env.K6_VERSION ||= 'unknown'; }
const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, '../..');
const resultsDir = resolve(root, 'results');
const latestReport = resolve(resultsDir, 'latest.json');
const previousMtime = existsSync(latestReport) ? statSync(latestReport).mtimeMs : 0;
const entry = profile === 'browser' ? resolve(root, 'browser/realistic-user.js') : resolve(root, 'main.js');
mkdirSync(resultsDir, { recursive: true });
console.log(`Starting k6 ${profile} test against ${process.env.BASE_URL}; reports: ${resultsDir}`);
const result = spawnSync('k6', ['run', entry], { cwd: repoRoot, stdio: 'inherit', env: { ...process.env, K6_SUMMARY_TREND_STATS: 'avg,min,med,max,p(50),p(75),p(90),p(95),p(99),p(99.9)' } });
if (result.error?.code === 'ENOENT') throw new Error('k6 is not installed or not on PATH. Install k6, then rerun the selected profile.');
if (result.error) throw result.error;
if (existsSync(latestReport) && statSync(latestReport).mtimeMs > previousMtime) {
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const archivedReport = resolve(resultsDir, `${stamp}.json`);
  copyFileSync(latestReport, archivedReport);
  console.log(`Report written: ${latestReport}`);
  console.log(`Run archive: ${archivedReport}`);
} else {
  console.error(`No fresh summary was written. Inspect the k6 output above; expected ${latestReport}`);
}
process.exit(result.status ?? 1);
