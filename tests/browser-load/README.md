# Browser load testing

An isolated Bun + TypeScript + Playwright Test system. Chromium is shared as one browser process; each virtual user gets a fresh, isolated browser context and page, then runs a variable-length browsing session with randomized think time, scrolling, internal link choices, and occasional history back-navigation. `SEED` seeds per-user behavior for replay. It does not start application servers.

## Install and browser setup

From monorepo root:

```sh
bun install
bun run --cwd tests/browser-load install:browsers
```

Use Bun commands only. Chromium is the only installed/selected browser by default.

## Commands

```sh
bun run test:e2e                         # CI-safe smoke + journey specs (never runs the load runner)
bun run test:load:smoke                  # 3 users, 60 seconds by default
TARGET=local USERS=3 DURATION=60 bun run test:load
TARGET=production USERS=25 DURATION=300 ALLOW_PRODUCTION_LOAD_TEST=true TARGET_ALLOWLIST=sakshampy.in bun run test:load
USERS=25 DURATION=300 bun run test:load:heavy
bun --cwd tests/browser-load routes      # update a machine-readable discovered route list
```

Only run production load tests with authorization and a coordinated time window. Smoke load remains capped by `MAX_USERS`; higher loads require deliberately raising it. `bun run test:e2e` writes an HTML report to `tests/browser-load/reports/playwright/index.html` and JSON report next to it; traces/screenshots are retained only on test failures, and videos are off.

## Configuration

`TARGET` chooses `production` (default) or `local`; URL overrides are `PORTFOLIO_URL`, `DOCS_URL`, `BLOGS_URL`. Local defaults are ports 4321/4322/4323. Load controls: `USERS` (default 10, smoke 3), `DURATION` seconds (300, smoke 60), `MAX_USERS` (50), `MAX_DURATION` (600 seconds), `MAX_REQUESTS` (100000), `INITIAL_USERS`, `RAMP_UP_SECONDS`, `HOLD_SECONDS`, `RAMP_DOWN_SECONDS`. Behavior controls: `MIN_THINK_TIME_MS`, `MAX_THINK_TIME_MS`, `SEED`. Gate/allowlist: `ALLOW_PRODUCTION_LOAD_TEST=true` is mandatory above 3 users for production URLs; `TARGET_ALLOWLIST` is an optional comma-separated list of exact hosts or parent domains. Thresholds: `PERF_P95_MS`, `ERROR_RATE_PERCENT`, `FAILED_REQUEST_RATE_PERCENT`. See `.env.example` (Bun does not auto-load that file; export values or use your normal local environment loader).

Host allowlisting always limits link choices to configured app hosts. Route discovery reads actual Astro pages/content (including content slugs for the blog catch-all), reads sitemap URLs referenced from robots.txt, then does a bounded same-host HTML crawl. Generated/API/404 and asset routes are excluded. No guessed dynamic URLs are generated. Routes are classified and saved in `reports/routes.json` when invoking the routes command. Live discovery tolerates an unavailable host but the smoke suite reports reachability failures.

## Metrics and reports

Load outputs are actual observed samples: `reports/latest.json` (full run metadata, route manifest, runtime errors/network data), `summary.json` (headline stats and slow/broken routes), and `metrics.json` (per-route and raw navigation/request data). Data includes run ID, timestamp, commit, target, seed, Bun/Playwright/Chromium versions, page visits, successful/failed sessions, navigation percentiles, request/status data, failed requests, browser exceptions/console errors, 4xx/5xx broken-route candidates, and slow routes. Percentiles are nearest-rank. External asset failures are recorded separately from page/session failure; all app-host 404/410/5xx responses appear as broken-route candidates.

## Resource guidance and limits

A single Chromium process with one context per active user is cheaper than one process per user, but contexts still consume substantial memory. Start at 3–10 users on a developer machine; 25–50 concurrent users may need several GB RAM and multiple CPU cores, and should be validated gradually. This is browser-level user simulation, not a high-throughput HTTP benchmark. The runner bounds concurrent users and total requests, closes each context in `finally`, sets navigation timeouts, and stores request-level results only for the run. Ramp-up staggers user starts; use conservative settings against production. Current ramp-down setting is exposed for workflow planning but sessions stop at the configured duration; no request is made to third-party hosts intentionally.

## Known limitations

DNS/TCP/TLS/TTFB are extracted from browser navigation timing when available; paint/CLS observers may not yield values for every fast/prerendered page. Route coverage is bounded for live crawl and needs public reachable entry pages or source content. In-browser navigation metrics are not server-only latency, and third-party requests can skew page-load behavior. Sitemap parsing handles regular XML sitemap/index documents. Production performance should be judged against environment-specific thresholds and repeated runs, not a single noisy sample.
