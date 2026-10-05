# Pyreport

Pyreport is the monorepo dashboard for Playwright Test and browser-load artifacts. It uses the portfolio’s dark background, Manrope/DM Mono typography, and lime accent styling.

## Data flow

Running `bun run test:e2e`, `bun run test:load`, `bun run test:load:smoke`, or `bun run test:load:heavy` publishes the result into `public/reports/`. The publisher archives each execution under `public/reports/runs/<runId>/`, keeps `latest.json`, `summary.json`, and `runs.json` for the dashboard, and archives the Playwright HTML report for E2E runs. Load runs also publish raw `metrics.json` and `routes.json`. The dashboard reads these static JSON files at runtime and links to archived HTML reports.

These files are local build inputs: run tests before building/deploying pyreport to include newly generated test results in the deployment. The public reports contain URLs, timing/network metrics, browser console output, and failure details; do not publish them if those details are sensitive.

## Commands (from monorepo root)

```sh
bun run test:e2e
TARGET=local USERS=3 DURATION=60 SEED=123 bun run test:load
bunx turbo run dev --filter=pyreport
bunx turbo run build --filter=pyreport
```

Production load testing still requires `ALLOW_PRODUCTION_LOAD_TEST=true` and appropriate authorization. See `tests/browser-load/README.md` for configuration and safety controls.
