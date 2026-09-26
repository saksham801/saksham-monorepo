# Development and operations guide

This is the day-to-day guide for running, coding, checking, and safely preparing
the three Astro sites. The complete application code is in this repository:

```text
/home/saksham/blogs.sakshampy.in/monorepo/
├── apps/
│   ├── portfolio/   # https://sakshampy.in
│   ├── docs/        # https://docs.sakshampy.in
│   └── blogs/       # https://blogs.sakshampy.in
├── packages/
│   └── ui/          # shared design tokens and Astro primitives
├── .github/workflows/ci.yml
├── package.json     # Bun workspaces and root commands
├── bun.lock         # single workspace lockfile
├── turbo.json       # task dependencies and cache behavior
└── README.md
```

Keep the applications independent: a Docs change belongs in `apps/docs`, a
Blogs change in `apps/blogs`, a Portfolio change in `apps/portfolio`, and code
that is genuinely shared belongs in `packages/ui`.

## Requirements and first setup

- Bun `1.4.2` (the version recorded in the root `package.json`)
- Node.js `22.12+` for the Astro applications
- Git

In a terminal:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo
bun --version
node --version
bun install
```

Use the root `bun install` after cloning, changing a package manifest, or
switching branches. Do not use npm, pnpm, or yarn. The root `bun.lock` is the
only lockfile. Commit it with package manifest changes.

The repository intentionally has no Git remote configured. It is a local
monorepo candidate; do not push it to any of the three old production
repositories.

## Running a site locally

Start only the site you are working on. Each Astro app's default local port is
`4321`, so starting more than one may make Astro choose a fallback port.

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo/apps/portfolio
bun run dev
```

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo/apps/docs
bun run dev
```

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo/apps/blogs
bun run dev
```

Open the local URL printed by Astro, normally `http://localhost:4321`. Stop
the foreground server with `Ctrl+C`.

You can also start one application from the repository root using Turbo:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo
bunx turbo dev --filter=portfolio
# or: bunx turbo dev --filter=docs
# or: bunx turbo dev --filter=blogs
```

`bun run dev` at the root starts all workspace dev tasks through Turbo. For
daily work, prefer one filtered app so its port and logs are clear.

## Where to make changes

### Portfolio

- Pages/routes: `apps/portfolio/src/pages/`
- Main landing page: `apps/portfolio/src/pages/index.astro`
- Health/status page: `apps/portfolio/src/pages/health.astro`
- API endpoint: `apps/portfolio/src/pages/api/openstatus.ts`
- Layout and page metadata: `apps/portfolio/src/layouts/Layout.astro`
- Styles: `apps/portfolio/src/styles/global.css` and page/component styles
- Public static files: `apps/portfolio/public/`
- Astro and Worker setup: `apps/portfolio/astro.config.mjs`,
  `apps/portfolio/wrangler.jsonc`

### Docs

- Documentation Markdown/MDX pages: `apps/docs/src/content/docs/`
- Content collection setup: `apps/docs/src/content.config.ts`
- Starlight/Astro configuration, routes and navigation: `apps/docs/astro.config.mjs`
- Header, footer, title, and page frame: `apps/docs/src/components/`
- Docs theme: `apps/docs/src/styles/docs.css`
- Public static files: `apps/docs/public/`
- Cloudflare Worker setup: `apps/docs/wrangler.jsonc`

To add a page, create a Markdown or MDX file under `src/content/docs/`; its
path becomes its route. Update the sidebar/navigation in `astro.config.mjs` or
the app's components if the new page needs to be linked there. Docs uses
Starlight, and its navigation and page layout are intentionally Docs-specific.

### Blogs

- Home page: `apps/blogs/src/pages/index.astro`
- Blog listing: `apps/blogs/src/pages/blog/index.astro`
- Individual blog route: `apps/blogs/src/pages/blog/[...slug].astro`
- Blog articles: `apps/blogs/src/content/blog/`
- Content schema: `apps/blogs/src/content.config.ts`
- Header, footer, and date formatting: `apps/blogs/src/components/`
- Layouts: `apps/blogs/src/layouts/`
- Theme: `apps/blogs/src/styles/global.css`
- Public static files: `apps/blogs/public/`
- Cloudflare Worker setup: `apps/blogs/wrangler.jsonc`

Add an article as a Markdown/MDX file in `src/content/blog/` and follow the
frontmatter/schema used by the existing articles.

### Shared UI

- Package manifest/exports: `packages/ui/package.json`
- Reusable UI components: `packages/ui/src/components/`
- Shared TypeScript utilities: `packages/ui/src/index.ts`
- Shared colors and type tokens: `packages/ui/src/styles/tokens.css`

Apps import shared Astro components with package exports, for example:

```astro
import FormattedDate from "@saksham/ui/components/FormattedDate.astro";
```

Shared colors are imported from `@saksham/ui/styles/tokens.css`. Keep
application-specific navigation, page structure, content, and UX in the app
that owns them. The package currently has no separate generated build needed
to consume its Astro/CSS exports; Turbo still includes its tasks in the graph
and tracks it as an app dependency.

## Adding dependencies

Add a dependency to the app or package that actually uses it. For example:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo/apps/docs
bun add some-package
```

For a development-only dependency, use `bun add -d some-package`. For a shared
package dependency, run the same command from `packages/ui`. Then return to the
root, run `bun install`, validate, and commit the relevant `package.json` and
root `bun.lock`. Do not move dependencies to the root just to make them
available to all apps.

## Checks and production builds

Run all workspace checks from the monorepo root:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo
bunx turbo lint
bunx turbo typecheck
bunx turbo build
```

Or run the combined root check:

```bash
bunx turbo check
```

The combined check runs each package's lint, typecheck, and build tasks.
Application builds depend on that app's typecheck, which avoids overlapping
Astro generated-state writes. Turbo caches successful tasks; rerunning an
unchanged task should report a cache hit.

Build only one app:

```bash
bunx turbo build --filter=portfolio
bunx turbo build --filter=docs
bunx turbo build --filter=blogs
```

Or run its Astro command from its app directory:

```bash
cd apps/blogs
bun run build
```

Run a local Astro preview after building:

```bash
cd apps/blogs
bun run preview
```

Replace `blogs` with `docs` or `portfolio` as needed. Builds write generated
files under each app's ignored `dist/` and `.astro/` directories.

## Environment variables and secrets

Portfolio's OpenStatus integration expects:

- `OPENSTATUS_MONITOR_ID`: Worker variable (not a secret)
- `OPENSTATUS_API_KEY`: secret; never commit or paste its value into source,
  docs, or chat

For local development, copy the example file and supply values privately:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo
cp apps/portfolio/.dev.vars.example apps/portfolio/.dev.vars
```

Edit `apps/portfolio/.dev.vars` locally; it is ignored by Git. Never add the
real `.dev.vars` file to a commit. Blogs and Docs had no app-specific env-file
names in the inspected configuration. Cloudflare account credentials are not
stored in this repository.

## Cloudflare builds and production deployment

Each app retains its own Worker, Wrangler config, domain, and deployment
ownership:

| App directory | Worker name | Production URL |
| --- | --- | --- |
| `apps/portfolio` | `saksham` | <https://sakshampy.in> |
| `apps/docs` | `docs` | <https://docs.sakshampy.in> |
| `apps/blogs` | `blogs` | <https://blogs.sakshampy.in> |

The Wrangler files are `apps/<app>/wrangler.jsonc`. To assemble and validate a
Worker bundle without publishing it:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo/apps/portfolio
bun run build
bunx wrangler deploy --dry-run
```

Repeat in the intended app directory for Docs or Blogs. `--dry-run` does not
deploy.

The existing deploy script performs a real deployment. It must only be run
after the intended Cloudflare account, credentials, Worker settings, and
production cutover approval have been independently verified:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo/apps/portfolio
bun run deploy
```

Use the same command from `apps/docs` or `apps/blogs` to deploy that specific
app. There is no automatic production deploy workflow. The Cloudflare account
and production deployment configuration have not been verified for this local
monorepo, so do not deploy from it or add production credentials until an owner
confirms the intended setup. Never change DNS, domains, or the old Workers as
part of normal local development.

## Git, history, and rollback

The monorepo Git repository is at:

```text
/home/saksham/blogs.sakshampy.in/monorepo/.git
```

The old repositories (`blogs/`, `docs/`, and `saksham/` alongside the monorepo)
were left unchanged. Full bare Git backups are in the external directory
documented in `MIGRATION.md`. Local `archive/*` branches retain each imported
history and the extra Docs branches. The new repository has no remote: do not
force-push it or use it to overwrite the old repositories.

Before production cutover, keep the old repositories and Cloudflare Workers
active. If a candidate change fails, do not alter DNS; revert the monorepo
change or restore from its source history/backup. `MIGRATION.md` records the
source commits, branch handling, validation evidence, and rollback procedure.

## CI behavior

`.github/workflows/ci.yml` runs install, lint, typecheck, and builds on relevant
pull requests and pushes to `main`. It does not deploy. Existing production
deployment ownership was not verifiable from the source checkouts, so
production automation is intentionally not configured.

## Common workflow

1. Change directory to the monorepo root and run `bun install` if dependencies
   or branch state changed.
2. Start the relevant app from its `apps/<app>` folder with `bun run dev`.
3. Make the change in that app's `src/`, `public/`, or config; use
   `packages/ui/` only for genuinely shared functionality.
4. Run `bunx turbo lint`, `bunx turbo typecheck`, and the relevant filtered
   `bunx turbo build --filter=<app>`.
5. Review `git diff`, make sure no secrets/generated files are staged, and
   preserve the app-specific Cloudflare configuration.
6. Use Wrangler dry run for deployment bundle validation. Do not publish until
   production account/configuration and approval are confirmed.
