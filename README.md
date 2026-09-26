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
Cloudflare and are not stored here. To have pushes to the monorepo deploy these
Workers automatically, connect each existing Worker to this same GitHub
repository and configure its own root, build/deploy commands, production
branch, and path filters. The full dashboard procedure and exact settings are
in [DEVELOPMENT.md](./DEVELOPMENT.md#cloudflare-workers-builds-from-the-monorepo).

For an explicitly manual deployment, the app-specific scripts are:

```bash
bun --cwd apps/portfolio run deploy
bun --cwd apps/docs run deploy
bun --cwd apps/blogs run deploy
```

The Git remote `origin` points to
`git@github.com:saksham801/saksham-monorepo.git`. A push only triggers a
Cloudflare Worker if that Worker is connected to this monorepo in Cloudflare
Workers Builds and its configured production branch/path filters match the
changed files. The three old GitHub repositories are not updated by the
monorepo push.

## Install and develop

See [DEVELOPMENT.md](./DEVELOPMENT.md) for the complete guide to repository
layout, editing application code/content, environment variables, local
development, validation, Cloudflare dry runs, and deployment safety.

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
They do not deploy. Cloudflare Workers Builds can perform production deployment
separately for each connected Worker. See [MIGRATION.md](./MIGRATION.md) for the
source commits, backup location, history procedure, validation, and rollback
steps.
