# Saksham sites monorepo

Independent Astro applications managed with Bun workspaces and Turborepo. Each
application retains its own routes, Astro integrations, Wrangler configuration,
Worker, environment, and Cloudflare deployment ownership.

## Applications and deployments

| Workspace | Previous repository | Cloudflare Worker | Production URL |
| --- | --- | --- | --- |
| `apps/portfolio` | `saksham801/portfolio` | `saksham` | <https://sakshampy.in> |
| `apps/docs` | `saksham801/docs` | `docs` | <https://docs.sakshampy.in> |
| `apps/blogs` | `saksham801/blogs` | `blogs` | <https://blogs.sakshampy.in> |

Each app's `wrangler.jsonc` remains authoritative for its Worker configuration.
Production credentials and any custom-domain/account settings remain managed by
Cloudflare and are not stored here. The existing deployment scripts are
application-specific; run them manually only after selecting the intended
Cloudflare account and verifying its credentials:

```bash
bun --cwd apps/portfolio run deploy
bun --cwd apps/docs run deploy
bun --cwd apps/blogs run deploy
```

There is no automatic production deployment workflow. The existing repositories
and deployments are retained; this migration does not push to GitHub, alter
Cloudflare, or change DNS.

## Install and develop

```bash
bun install
bun run dev
bun run build
```

The equivalent Turbo commands are:

```bash
bunx turbo dev
bunx turbo build
bunx turbo lint
bunx turbo typecheck
bunx turbo check
```

Run one app at a time with Turbo filters:

```bash
bunx turbo dev --filter=portfolio
bunx turbo build --filter=portfolio
bunx turbo build --filter=docs
bunx turbo build --filter=blogs
```

Astro development servers use their normal port fallback when all apps run
together. Use app-specific `dev` scripts when a fixed port is needed.

## Shared packages

`@saksham/ui` owns the color and typography tokens taken from the blogs theme
and the reusable `FormattedDate` Astro primitive. Apps consume the tokens while
keeping their own navigation, layouts, and content components. Docs retains its
Starlight-based sidebar, table of contents, pagination, mobile navigation, and
Pagefind search; Portfolio retains its own project, tools, experience, and
contact sections. The UI package is a workspace dependency, so Turbo rebuilds
dependent apps when it changes. No utility or config package was added without
a demonstrated need.

## Environment

Portfolio's OpenStatus integration uses `OPENSTATUS_API_KEY` as a Cloudflare
secret and `OPENSTATUS_MONITOR_ID` as a Worker variable. The secret value is
never committed. `apps/portfolio/.dev.vars.example` lists the names for local
development; copy it to `.dev.vars` and fill in local-only values. Blogs and
Docs had no application env-file names in their checked-in configuration.

## CI and rollback

Pull-request and `main` branch checks run lint, Astro type checks, and builds.
They do not deploy. Cloudflare deployments remain separately owned by the
existing per-app Wrangler scripts. See [MIGRATION.md](./MIGRATION.md) for the
source commits, backup location, history procedure, validation, and rollback
steps.
