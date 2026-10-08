import { readFileSync } from 'node:fs';

const [previousPath, currentPath] = process.argv.slice(2);
if (!previousPath || !currentPath) throw new Error('Usage: bun run test:compare -- previous.json current.json');
const previous = JSON.parse(readFileSync(previousPath, 'utf8'));
const current = JSON.parse(readFileSync(currentPath, 'utf8'));
const rows = [
  ['p95 latency', previous.p95_ms, current.p95_ms, 'ms'],
  ['p99 latency', previous.p99_ms, current.p99_ms, 'ms'],
  ['RPS', previous.request_rate_per_second, current.request_rate_per_second, ''],
  ['Error rate', previous.error_rate, current.error_rate, '%'],
];
console.log('Metric               Previous       Current        Change');
console.log('-----------------------------------------------------------');
let regression = false;
for (const [name, before, after, unit] of rows) {
  if (before == null || after == null) { console.log(`${name.padEnd(21)} n/a            n/a            n/a`); continue; }
  const change = before === 0 ? (after === 0 ? 0 : Infinity) : ((after - before) / Math.abs(before)) * 100;
  const label = Number.isFinite(change) ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : 'new';
  console.log(`${name.padEnd(21)} ${String(before).padEnd(14)} ${String(after).padEnd(14)} ${label}`);
  if ((name.includes('latency') || name === 'Error rate') && change >= Number(process.env.REGRESSION_THRESHOLD || 20)) regression = true;
}
console.log(regression ? '\nWARNING: one or more latency/error metrics regressed beyond the configured threshold.' : '\nNo configured latency/error regression detected.');
process.exitCode = regression ? 1 : 0;
