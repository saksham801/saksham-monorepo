# Site performance testing (k6)

Two intentionally separate modes are provided: **HTTP mode** for controlled, high-scale protocol load and **browser mode** for a small number of real Chromium journeys. HTTP mode models page navigation and reading think-time but does not download browser subresources or claim to execute scrolls; use browser mode to measure actual page lifecycle/scroll behavior. Neither mode submits mutations.

## Repository route inventory (inspected 2026-10-08)

| App | Framework / rendering | Public routes exercised | APIs / behavior |
|---|---|---|---|
| `apps/portfolio` (`sakshampy.in`) | Astro; prerendered homepage and terms, health page; Cloudflare adapter | `/`, `/health`, `/terms` | `GET /api/openstatus` proxies OpenStatus with a configured secret and is opt-in (`TEST_API=true`); returns 503 if not configured. |
| `apps/blogs` (`blogs.sakshampy.in`) | Astro + MDX; server output, prerendered content collection | `/`, `/blog/`, `/about`, `/terms`, and `/blog/{cloudflare-workers-production-architecture,cpp-coroutines-executors,cpp-raii-smart-pointers,python-asyncio-structured-concurrency,python-packaging-reproducible-services,rust-error-handling-production,rust-ownership-borrowing}/` | No app API routes discovered; `/rss.xml` is a feed, excluded from human journeys. |
| `apps/docs` (`docs.sakshampy.in`) | Astro Starlight; content-generated documentation pages | `/`, `/guides/about/`, `/reference/toolbox/`, `/languages/{rust,cpp,python}/`, `/languages/rust/{ownership,tooling}/`, `/languages/cpp/{memory,tooling}/`, `/languages/python/{packaging,tooling}/`, `/terms/` | Static/content pages; Starlight search and Pagefind are client-side. |
| `apps/report` | Astro report app | `/` | No API routes discovered; not treated as a visitor-facing site since it is a report artifact app. |
| `apps/pyreport` | Build/runtime artifacts only; no tracked app source or manifest found | None discovered | Excluded. |

The checked-in route groups contain 27 human-facing routes. Routes and links were checked against page files, content collections, Starlight's sidebar/navigation, Astro configuration and the existing `tests/browser-load/reports/routes.json`. There is no Next.js app, backend service, auth-protected route, project detail route, or destructive endpoint in the inspected application sources. The portfolio's displayed project cards are sections on its homepage, not distinct routes. This inventory is maintained explicitly in `config/routes.js`; update it when pages/content are added. Search, RSS, sitemap, `llms.txt`, static assets, and health endpoints are not normal reading journeys (health is included as a safe page check).

### Origins

`BASE_URL` is required and explicitly selects the portfolio / primary target. Since the apps deploy independently, configure `BLOGS_URL` and `DOCS_URL` to include those origins when testing them. Without these, all apps intentionally resolve against `BASE_URL`, useful for a local single-origin deployment. `REPORT_URL` isn't tested because no public visitor routes were identified. Never point a multi-origin test at production without setting and confirming every origin.

## Prerequisites and commands

Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) (v0.49+; browser mode requires a k6 build with the experimental browser module and Chromium dependencies). The repository uses Bun 1.4+.

For repeat runs without typing URLs each time, copy the root template to `.env` and edit the URLs for your local servers or explicitly authorized staging environment:

```sh
cp .env.example .env
# Edit .env, then run:
bun run test:smoke
bun run test:stress
```

Bun loads the root `.env` for these commands. `.env` is ignored by git; do not commit credentials or private environment values. For separate deployments, set `BASE_URL` to the portfolio origin and set `BLOGS_URL` and `DOCS_URL` to their respective origins. The sample uses localhost placeholders only; start the matching local apps first. You can still override any value inline:

```sh
BASE_URL=https://authorized-staging.example BLOGS_URL=https://blogs-staging.example DOCS_URL=https://docs-staging.example bun run test:load
bun run test:spike
bun run test:soak
bun run test:browser
```

A local runtime verification fixture (no production traffic) exercises multiple journey routes, checks that route metrics/report output are populated, and deliberately returns a 500 on `/` to verify error detection:

```sh
node tests/performance/verify-k6-runtime.js
```

Direct HTTP invocation (from repository root):

```sh
BASE_URL=http://127.0.0.1:4321 TEST_TYPE=smoke TARGET_VUS=1 TEST_DURATION=1m SEED=12345 k6 run tests/performance/main.js
```

The runner requires an explicit `BASE_URL` and only accepts HTTP(S). It does not infer or silently pick a live target. Start with smoke on local/staging. Production testing is an operator decision: coordinate a maintenance window, verify target hostnames and rate-limit policy, obtain authorization, begin with one or two VUs, ramp in small steps, monitor server/CDN/database health, and stop immediately if errors or user impact increase. Do not use this to evade a WAF or exceed an approved load budget. No breakpoint test is in the default scripts; `breakpoint` is an opt-in profile and should only be run in a controlled environment.

## Profiles and configuration

`TEST_TYPE`: `smoke` (1 VU, 1 minute), `load` (default 50 VUs with 2-minute ramp and 10-minute hold), `stress` (increasing 10/25/50/75/100% stages), `spike` (rapid ramp to target), `soak` (ramp, extended hold), `breakpoint` (stress-style ramp, opt-in). Set `TARGET_VUS`, `TEST_DURATION`, `RAMP_DURATION`, and thresholds as environment variables. The `ramping-vus` executor ramps to configured stage targets directly; there is no separate `MAX_VUS` cap. Stress stage durations are currently fixed at two minutes per level. `SEED` defaults to 12345 and is offset per VU for reproducible but distinct streams. `CACHE_MODE` labels warm/cold results; cold mode does not bypass caches. `TEST_API=true` opts in to the safe GET status proxy (which makes a third-party upstream request); do not enable unless its expected load is acceptable.

Threshold defaults: HTTP error rate <1%, p95 <1500ms, p99 <3000ms. These are conservative starting guardrails, not service SLO claims; set them to the measured baseline and product SLO with `ERROR_RATE_THRESHOLD`, `P95_THRESHOLD`, and `P99_THRESHOLD` (milliseconds). Threshold failures make k6 exit non-zero. Requests use status checks and automatic redirect following; timeouts, connection failures, and 4xx/5xx appear in built-in k6 HTTP metrics. Route/app/persona/device/page type/status tags are attached to custom and HTTP metrics. Standard trend stats include average, min, max, p50, p75, p90, p95, p99 and p99.9.

Browser mode: `TARGET_VUS` should generally be 1–5, not hundreds; set `TEST_DURATION`. It uses one Chromium page per active VU, distributed 70/30 desktop/mobile, navigates between real inventory routes, dwells and scrolls. Browser performance is not a replacement for HTTP load generation. Browser installation requirements vary by k6 distribution; test the installed browser build before use.

## Results, coverage, regression

Each successful invocation writes `results/latest.json` and an ISO timestamped JSON copy. The summary includes run type, target, seed, git revision, k6 version, request/latency/error totals, route inventory/coverage and raw k6 metrics; browser runs include browser errors. `stdout` includes a concise assessment. Per-route visits, failures, and p95 use dedicated route-specific custom metrics and are summarized in the `routes` array; k6's end-of-test summary does not reliably retain arbitrary tag combinations unless explicitly materialized. Routes are discovered from source/content inventory, not crawled at runtime; route coverage means routes with observed HTTP samples, so a short randomized smoke can legitimately report partial coverage. The full route list is always in the report and absent routes are explicitly marked untested.

Compare runs:

```sh
bun run test:compare -- tests/performance/results/previous.json tests/performance/results/latest.json
```

`REGRESSION_THRESHOLD` defaults to a 20% increase in p95/p99/error rate and returns exit 1 when exceeded. Compare only runs with the same target, profile, VU/duration, seed, and deployment conditions.

## Reading results and infrastructure

- **RPS** is completed HTTP requests per second (not unique users); request count includes every page/API navigation performed by each journey.
- **p95/p99** mean 95%/99% of measured requests completed at or below that latency; inspect route-tagged trends to isolate slow pages. Averages hide tail problems.
- **Error rate** is failed HTTP requests (including status failures/timeouts) divided by requests; browser errors are reported separately.
- **VUs** are concurrently active k6 journey workers, not exact human sessions or server connections. Think time reduces achieved RPS.
- **Coverage** is the fraction of inventory routes observed at least once in this run; repeat/lengthen or run a dedicated coverage pass to test all routes.

Correlate timestamps and VU stages with Cloudflare analytics/cache status headers, origin CPU/RAM/network/disk I/O, worker/request concurrency, database CPU/latency/connection-pool saturation and Redis/cache hit ratio. k6 records response headers only when explicitly configured; do not add sensitive headers to shared output. The repository does not expose a Prometheus scrape endpoint or server telemetry integration that could be safely wired here. Export those signals from the deployment platform or your existing observability stack; keep the k6 client and server dashboards time-aligned.

## Known limits

HTTP journeys issue real page GETs and realistic pauses, but HTTP mode cannot execute DOM clicks, render pages, download dependent assets, or perform physical scrolling. Browser mode measures real navigations and scrolling. Route coverage comes from this checked-in inventory, so update it alongside Astro routes/content. No authentication, payment, or mutating calls are included. API GET testing is opt-in because the status proxy can call an external provider.
