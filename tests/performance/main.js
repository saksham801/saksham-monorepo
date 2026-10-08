import { options } from './options.js';
import journey from './journeys.js';
import { allRoutes } from './config/routes.js';

export { options };
export function realisticUserJourney() {
  journey();
}
export default realisticUserJourney;

export function handleSummary(data) {
  const routes = allRoutes();
  const requests = data.metrics.http_reqs?.values?.count || 0;
  const failedRate = data.metrics.http_req_failed?.values?.rate || 0;

  const routeMetricKey = (app, path) => `${app}_${path.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'root'}`;
  const routeRows = routes.map(({ app, path, type }) => {
    const key = routeMetricKey(app, path);
    const duration = data.metrics[`route_duration_${key}`];
    const visits = data.metrics[`route_visits_${key}`]?.values?.count || 0;
    const errors = data.metrics[`route_errors_${key}`]?.values?.count || 0;
    return { app, route: path, type, visits, errors, p95_ms: duration?.values?.['p(95)'] ?? null, tested: visits > 0 };
  });
  const tested = routeRows.filter((row) => row.tested).length;
  const summary = {
    test_type: __ENV.TEST_TYPE || 'smoke', base_url: __ENV.BASE_URL || null,
    started_at: data.state?.testRunDurationMs ? new Date(Date.now() - data.state.testRunDurationMs).toISOString() : null,
    ended_at: new Date().toISOString(), seed: Number(__ENV.SEED || 12345), target_vus: Number(__ENV.TARGET_VUS || 1),
    peak_vus: data.metrics.vus_max?.values?.max || data.metrics.vus?.values?.max || null,
    total_requests: requests, request_rate_per_second: data.metrics.http_reqs?.values?.rate || 0,
    journeys_started: data.metrics.journeys_started?.values?.count || 0,
    journeys_completed: data.metrics.journeys_completed?.values?.count || 0,
    journeys_failed: data.metrics.journeys_failed?.values?.count || 0,
    requests_per_minute: (data.metrics.http_reqs?.values?.rate || 0) * 60,
    status_2xx: data.metrics.http_2xx?.values?.count || 0, status_3xx: data.metrics.http_3xx?.values?.count || 0,
    status_4xx: data.metrics.http_4xx?.values?.count || 0, status_5xx: data.metrics.http_5xx?.values?.count || 0,
    timeouts: data.metrics.timeout_errors?.values?.count || 0,
    bytes_received: data.metrics.data_received?.values?.count || 0,
    average_latency_ms: data.metrics.http_req_duration?.values?.avg ?? null,
    p50_ms: data.metrics.http_req_duration?.values?.['p(50)'] ?? null,
    p90_ms: data.metrics.http_req_duration?.values?.['p(90)'] ?? null,
    p95_ms: data.metrics.http_req_duration?.values?.['p(95)'] ?? null,
    p99_ms: data.metrics.http_req_duration?.values?.['p(99)'] ?? null,
    max_latency_ms: data.metrics.http_req_duration?.values?.max ?? null,
    error_rate: failedRate, checks_passed: data.metrics.checks?.values?.passes || 0, checks_failed: data.metrics.checks?.values?.fails || 0,
    routes_discovered: routes.length, routes_tested: tested, routes_not_tested: routes.length - tested,
    route_coverage_percent: routes.length ? Number((tested / routes.length * 100).toFixed(1)) : 0,
    routes: routeRows,
    slowest_routes: [...routeRows].filter((row) => row.p95_ms !== null).sort((a, b) => b.p95_ms - a.p95_ms).slice(0, 10),
    most_requested_routes: [...routeRows].sort((a, b) => b.visits - a.visits).slice(0, 10),
    highest_error_routes: [...routeRows].filter((row) => row.visits).sort((a, b) => b.errors / b.visits - a.errors / a.visits).slice(0, 10),
    git_commit: __ENV.GIT_COMMIT || 'unknown', k6_version: __ENV.K6_VERSION || 'unknown',
    configuration: { target_vus: Number(__ENV.TARGET_VUS || ( __ENV.TEST_TYPE === 'smoke' ? 1 : 50)), test_duration: __ENV.TEST_DURATION || ( __ENV.TEST_TYPE === 'smoke' ? '1m' : '10m'), max_vus: __ENV.MAX_VUS || null, ramp_duration: __ENV.RAMP_DURATION || null, p95_threshold_ms: Number(__ENV.P95_THRESHOLD || 1500), p99_threshold_ms: Number(__ENV.P99_THRESHOLD || 3000), error_rate_threshold: Number(__ENV.ERROR_RATE_THRESHOLD || 0.01), cache_mode: __ENV.CACHE_MODE || 'warm' },
    assessment: requests === 0 || !(data.metrics.journeys_started?.values?.count) || failedRate >= Number(__ENV.ERROR_RATE_THRESHOLD || 0.01) || (data.metrics.http_req_duration?.values?.['p(95)'] || 0) >= Number(__ENV.P95_THRESHOLD || 1500) || (data.metrics.http_req_duration?.values?.['p(99)'] || 0) >= Number(__ENV.P99_THRESHOLD || 3000) ? 'FAIL' : (tested < routes.length ? 'WARNING' : 'PASS'),
    raw_metrics: data.metrics,
  };
  const lines = [
    `k6 ${summary.test_type}: ${summary.assessment}`,
    `Target: ${summary.base_url || '(unset)'} | requests: ${requests} | RPS: ${summary.request_rate_per_second.toFixed(2)} | peak VUs: ${summary.peak_vus ?? 'n/a'}`,
    `Latency avg/p50/p90/p95/p99/max: ${summary.average_latency_ms ?? 'n/a'} / ${summary.p50_ms ?? 'n/a'} / ${summary.p90_ms ?? 'n/a'} / ${summary.p95_ms ?? 'n/a'} / ${summary.p99_ms ?? 'n/a'} / ${summary.max_latency_ms ?? 'n/a'} ms`,
    `HTTP error rate: ${(failedRate * 100).toFixed(2)}% | route coverage: ${tested}/${routes.length} (${summary.route_coverage_percent}%)`,
    `Journeys: ${summary.journeys_completed}/${summary.journeys_started} completed; ${summary.journeys_failed} script failures. Route visits and latency are counted by route.`,
  ].join('\n');
  return { 'tests/performance/results/latest.json': JSON.stringify(summary, null, 2), stdout: `${lines}\n` };
}
