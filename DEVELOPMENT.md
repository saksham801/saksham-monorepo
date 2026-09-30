# Development and operations guide

This is the day-to-day guide for running, coding, checking, and safely preparing
the Astro applications. The complete application code is in this repository:

```text
/home/saksham/blogs.sakshampy.in/monorepo/
├── apps/
│   ├── portfolio/   # https://sakshampy.in
│   ├── docs/        # https://docs.sakshampy.in
│   ├── blogs/       # https://blogs.sakshampy.in
│   └── report/      # Worker URL not recorded
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
- Node.js `22.18+` for Cloudflare CLI configuration loading and app commands
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

The monorepo's `origin` is `git@github.com:saksham801/saksham-monorepo.git`.
Push to that repository, not the three original app repositories. See
[Pushing and GitHub sync](#pushing-and-github-sync).

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
- Astro setup: `apps/portfolio/astro.config.mjs`
- Cloudflare CLI setup: `apps/portfolio/cloudflare.config.ts`

### Docs

- Documentation Markdown/MDX pages: `apps/docs/src/content/docs/`
- Content collection setup: `apps/docs/src/content.config.ts`
- Starlight/Astro configuration, routes and navigation: `apps/docs/astro.config.mjs`
- Header, footer, title, and page frame: `apps/docs/src/components/`
- Docs theme: `apps/docs/src/styles/docs.css`
- Public static files: `apps/docs/public/`
- Cloudflare CLI setup: `apps/docs/cloudflare.config.ts`

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
- Cloudflare CLI setup: `apps/blogs/cloudflare.config.ts`

Add an article as a Markdown/MDX file in `src/content/blog/` and follow the
frontmatter/schema used by the existing articles.

### Report

- Cloudflare Worker package: `apps/report/`
- Worker configuration: `apps/report/cloudflare.config.ts`
- The production URL and dashboard ownership have not been recorded; confirm
  both before connecting or deploying this Worker.

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
unchanged task should report a local cache hit. `turbo.json` stores that cache
in `.turbo/cache`, keeps entries for up to 30 days, and caps it at 5 GB. The
cache is ignored by Git.

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

### Local Turbo cache

Local caching is automatic and requires no account or token. From the
repository root:

```bash
bunx turbo build --filter=portfolio
bunx turbo build --filter=portfolio
```

The second unchanged build should report `FULL TURBO` / cached tasks and
restore declared outputs such as `apps/portfolio/dist/` from `.turbo/cache`.
The same local cache also applies to `lint`, `typecheck`, and other cacheable
tasks. Development and preview servers are intentionally not cached.

To force a fresh execution without deleting stored artifacts:

```bash
bunx turbo build --filter=portfolio --force
```

To inspect cache-related output:

```bash
bunx turbo build --filter=portfolio --summarize
du -sh .turbo/cache
```

### Shared Turbo Remote Cache (Vercel)

Turbo's local filesystem cache only helps on the same machine. A remote cache
lets this workstation, GitHub Actions, and other authorized developers reuse
matching task logs and outputs. This repository uses Vercel Remote Cache, which
is compatible with Turbo and does not require hosting these Astro sites on
Vercel. A Vercel team, login, and token are required; none of those credentials
are stored in this repository.

#### Set up this workstation once

1. Sign in to the Vercel account/team that will own the shared cache.
2. From the monorepo root, authenticate Turbo and link this repository to that
   Vercel team:

   ```bash
   cd /home/saksham/blogs.sakshampy.in/monorepo
   bunx turbo login
   bunx turbo link --scope=YOUR_VERCEL_TEAM_SLUG
   ```

   Replace `YOUR_VERCEL_TEAM_SLUG` with the actual Vercel team scope; do not
   guess it. If the account requires SSO, use Turbo's documented
   `bunx turbo login --sso-team=YOUR_VERCEL_TEAM_SLUG` flow. These commands
   authenticate/link this machine and repository; they do not deploy the sites
   or change Cloudflare.
3. Run a cacheable task to populate the remote, then verify from another
   machine/clean clone. To verify on this machine instead, first ensure the
   artifact was uploaded and then clear only the local task cache:

   ```bash
   rm -rf .turbo/cache
   bunx turbo build --filter=portfolio
   ```

   The second command should report a **remote** hit and restore the outputs.
   This deletion is only for cache verification; keep `.turbo/cache` intact
   for ordinary local use.

If `turbo link` selects the wrong Vercel scope, stop and relink to the intended
team rather than using a token from a different team. Authentication is stored
outside Git by Turbo. Never commit access tokens, `.vercel` credentials, or
`.turbo` authentication/config files.

#### Enable remote cache in GitHub Actions

The CI workflow already passes `TURBO_TEAM` and `TURBO_TOKEN` to Turbo:

- Add a GitHub **Actions repository variable** named `TURBO_TEAM` containing
  the Vercel team slug (not a token).
- Add a GitHub **Actions repository secret** named `TURBO_TOKEN` containing a
  Vercel token authorized to read/write that team's Remote Cache.
- Keep the token scoped to the least privileges Vercel offers. Rotate it if
  exposed. Never put it in `package.json`, `turbo.json`, `.env`, workflow
  literals, or command-line arguments stored in shell history.
- For pull requests from forks, GitHub does not expose repository secrets.
  Those runs continue with local ephemeral caching only; this is expected and
  safer than exposing a write-capable cache token to untrusted code.

After setting the variable and secret, push a change that affects a cacheable
task and inspect the GitHub Actions logs. Look for a remote cache store, then
rerun the same unchanged commit/workflow and verify remote cache hits. A
successful hit should identify the remote cache as the source, not only show a
generic local hit. CI still runs Turbo and validates the task graph; remote
caching only avoids repeated task execution when the hash and environment
match.

Remote cache is **not fully authenticated or active yet** until a Vercel team
is selected, local Turbo is logged in/linked, and the GitHub variable/secret
are configured. This environment did not have `TURBO_TEAM` or `TURBO_TOKEN`,
so no remote cache login, upload, or download could be verified here. Local
cache is configured and working independently.

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

## Cloudflare configuration and production deployment

All four app configurations have been migrated to typed
`cloudflare.config.ts` files using Cloudflare's official `cf migrate` command
and follow-up guidance. `cf workers types` succeeds for each app. However,
Portfolio's `cf build` currently fails after the Astro build because the Astro
Cloudflare adapter does not produce the Build Output that `cf deploy`
requires. `cf` is in beta, so this migration is not ready for production
deployment; verify the `cf` build and dry run for every app before cutover.

For safety, the existing `wrangler.jsonc` files and Wrangler-based deployment
scripts remain active. `wrangler.config.ts` is retained for the `cf` migration
and build settings; Wrangler deployments continue to use `wrangler.jsonc`.
Do not replace the deployment commands or remove these compatibility files
until Cloudflare CLI can build and dry-run each Astro Worker successfully.
Node.js 22.18+ is required to load `cloudflare.config.ts`; Bun remains the
package manager and workspace runner.

| App directory | Worker name | Production URL |
| --- | --- | --- |
| `apps/portfolio` | `saksham` | <https://sakshampy.in> |
| `apps/docs` | `docs` | <https://docs.sakshampy.in> |
| `apps/blogs` | `blogs` | <https://blogs.sakshampy.in> |
| `apps/report` | `report` | Not recorded; confirm before deployment |

To validate the current production deployment path without publishing, run
these commands from only the app being checked:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo/apps/portfolio
bun run build
bunx wrangler deploy --dry-run
```

This dry run does not publish. Review output for the expected Worker name,
bindings, routes, and assets. Repeat for `docs`, `blogs`, or `report` only
when needed. `bun run cf-typegen` exercises the migrated `cf` configuration
without deploying.

The existing `deploy` script still runs Astro build plus Wrangler deploy. It
performs a real deployment. Use it for one app at a time and only after the
existing Cloudflare Worker, target account, domains, bindings, production
variables/secrets, and current deployment have been verified in Cloudflare.
Never change DNS, domains, Worker ownership, or secrets as part of local
migration work. Cloudflare Workers Builds settings live in Cloudflare and are
not changed by this repository.

### Safe production cutover checklist

1. Confirm the monorepo CI checks pass on the intended production branch.
2. In Cloudflare, verify the account, existing Worker name, custom domains,
   bindings, production variables/secrets, Git connection, and current
   deployment. For `report`, do not deploy until its production URL and target
   Worker settings are confirmed. Keep the old GitHub repositories and last
   working commits available for rollback.
3. Run `bun run cf-typegen`, `bun run build`, and
   `bunx wrangler deploy --dry-run` from that app's directory. Stop if output
   does not match the verified Worker.
4. Test a preview/staging version and its important routes/assets. Authenticate
   with `bunx wrangler login` and verify the account with `bunx wrangler whoami`
   before a real deployment.
5. After explicit production approval, run `bun run deploy` from that one app.
   Smoke-test production and inspect Worker logs/errors. Keep the prior Worker
   and repo available; do not deploy all apps together for the first cutover.

Portfolio configuration continues to use Worker `saksham`. Preserve
`OPENSTATUS_API_KEY` as a **secret** and `OPENSTATUS_MONITOR_ID` as a
non-secret Worker variable in Cloudflare. The repository deliberately does
not contain either production value. Check and preserve all existing production
bindings/settings in the dashboard; do not infer values from the local example.

### Cloudflare Workers Builds from the monorepo

Configure each verified existing Worker separately against the monorepo.
Do not create a replacement Worker or change domains. Cloudflare Workers
Builds settings live in the dashboard; this repository migration does not
change them. Until `cf build` supports the Astro Cloudflare adapter here, keep
the current Wrangler build/deploy commands. Do not change a production
Workers Builds configuration to `cf deploy` before the `cf` build and
non-publishing dry run both succeed for that app.

Having a Worker connected to GitHub does not by itself make it deploy from
this monorepo: the Worker must be connected to the specific repository
`saksham801/saksham-monorepo`. Check its current Git repository first. If it
still points at `saksham801/blogs`, `saksham801/docs`, or
`saksham801/portfolio`, it is still building from that standalone repository.

For each existing Worker, open **Cloudflare Dashboard → Workers & Pages →
select the Worker → Settings → Builds** (some dashboard views label this
section **Build**). Confirm the Worker name and current deployment before
editing anything. In its Git/build settings, select the connected GitHub
account and `saksham801/saksham-monorepo`, then set:

| Setting | Portfolio `saksham` | Docs `docs` | Blogs `blogs` | Report `report` |
| --- | --- | --- | --- | --- |
| Git repository | `saksham801/saksham-monorepo` | `saksham801/saksham-monorepo` | `saksham801/saksham-monorepo` | Verify before connecting |
| Root directory | Repository root | Repository root | Repository root | Verify before connecting |
| Production branch | `main` | `main` | `main` | Verify before connecting |
| Build command | `bun install --frozen-lockfile && bunx turbo build --filter=portfolio` | `bun install --frozen-lockfile && bunx turbo build --filter=docs` | `bun install --frozen-lockfile && bunx turbo build --filter=blogs` | Verify before connecting |
| Deploy command | `cd apps/portfolio && bunx wrangler deploy` | `cd apps/docs && bunx wrangler deploy` | `cd apps/blogs && bunx wrangler deploy` | Only after target verification |
| Preview command (if enabled) | `cd apps/portfolio && bunx wrangler preview` | `cd apps/docs && bunx wrangler preview` | `cd apps/blogs && bunx wrangler preview` | Only after target verification |

**Use the repository root.** The apps depend on `@saksham/ui` through Bun
workspaces and the single root `bun.lock`. Do not set the Cloudflare root
directory to `apps/<app>`: a root install from inside an app would not have
the complete workspace context. Build commands start at the repository root;
deploy/preview commands change to the app directory so Wrangler loads the
correct config and relative output paths. Cloudflare Workers Builds can create
its deployment token automatically; do not paste a Cloudflare token into this
repository or a committed workflow.

Verify Workers Builds can run Node.js 22.18+ and the Bun version pinned in the
root `package.json` (`bun@1.4.2`), and that package installation uses the root
`bun.lock`. If the Cloudflare build environment cannot run this workspace,
stop and configure a supported runtime before enabling deployments. Do not
switch package managers or regenerate the lockfile with npm.

#### Restricting which pushes deploy each Worker

By default, a push to the connected repository can trigger a build for any
changed path. In each Worker go to **Settings → Build → Build watch paths**
(the exact label may be **Build watch paths** below Build settings). Set the
include paths below and leave excludes empty initially. The patterns are
evaluated against repository-relative paths:

| Worker | Include paths |
| --- | --- |
| Portfolio | `apps/portfolio/*`, `packages/ui/*`, `package.json`, `bun.lock`, `turbo.json`, `tsconfig.json` |
| Docs | `apps/docs/*`, `packages/ui/*`, `package.json`, `bun.lock`, `turbo.json`, `tsconfig.json` |
| Blogs | `apps/blogs/*`, `packages/ui/*`, `package.json`, `bun.lock`, `turbo.json`, `tsconfig.json` |
| Report | `apps/report/*`, `package.json`, `bun.lock`, `turbo.json`, `tsconfig.json` |

Do not add the other apps' paths to a Worker. App-local changes deploy only
that app; a shared UI or root workspace/build config change deploys all
connected apps.
Validate the watch-path matching with harmless test commits on a branch before
relying on it. Cloudflare may intentionally build when a push has no file
changes or exceeds its path-filter limits; path filters are an optimization,
not a security boundary.

With these filters, the intended result for a push to `main` is:

| Changed files | Workers expected to build/deploy |
| --- | --- |
| `apps/portfolio/**` | Portfolio only |
| `apps/docs/**` | Docs only |
| `apps/blogs/**` | Blogs only |
| `apps/report/**` | Report only, if connected after verification |
| `packages/ui/**` or a listed root workspace/build file | All connected apps |
| Only `DEVELOPMENT.md` or other unlisted documentation | None |

#### First-connection and cutover order

If a Worker is still connected to its old standalone repository, first record
the current repository, production branch, deploy/build/preview commands,
watch paths, Worker settings, bindings, and current production deployment.
Then update the Git connection on the **existing Worker** to
`saksham801/saksham-monorepo`; do not delete/recreate the Worker or change its
custom domain. If Cloudflare requires disconnecting before reconnecting, stop
and confirm the existing deployed Worker remains active and that the connection
can be restored before proceeding.

Move one Worker at a time:

1. Verify its new repository, root, commands, production branch, and watch
   paths; leave the other two Workers unchanged.
2. Run a preview build from a non-production branch if previews are enabled.
   Configure preview bindings/secrets separately and safely; do not assume a
   preview should inherit production secrets.
3. Push/merge a reviewed change affecting only that app's folder. Confirm
   Cloudflare's build log shows the expected filter, `dist/`, and Worker name.
4. Smoke-test the preview and then the production URL after the approved
   `main` build deploys. Verify assets, routes, logs, and the existing
   Worker/domain/bindings.
5. Confirm an unrelated app-only change does not trigger this Worker, and a
   shared UI change triggers each dependent Worker.
6. Only after this Worker is verified should you migrate the next Worker.
   Keep the old repositories and a known-good Cloudflare deployment available
   for rollback.

The repo's GitHub Actions workflow runs CI checks only; it does not deploy.
Cloudflare Workers Builds performs deployment on pushes to each Worker's
selected production branch when its paths match. In GitHub, require the CI
check and disable direct pushes to `main`; otherwise a direct push can start a
Cloudflare production deployment before checks complete.

Official Cloudflare references:

- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Workers Builds monorepos](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/#monorepos)
- [Build watch paths](https://developers.cloudflare.com/workers/ci-cd/builds/build-watch-paths/)
- [Production and preview branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)

## Git, history, and rollback

The monorepo Git repository is at:

```text
/home/saksham/blogs.sakshampy.in/monorepo/.git
```

The old repositories (`blogs/`, `docs/`, and `saksham/` alongside the monorepo)
were left unchanged. Full bare Git backups are in the external directory
documented in `MIGRATION.md`. Local `archive/*` branches retain each imported
history and the extra Docs branches. The monorepo remote is `origin`
(`git@github.com:saksham801/saksham-monorepo.git`). Do not force-push or use it
to overwrite the old repositories.

Before production cutover, keep the old repositories and Cloudflare Workers
active. If a candidate change fails, do not alter DNS; revert the monorepo
change or restore from its source history/backup. `MIGRATION.md` records the
source commits, branch handling, validation evidence, and rollback procedure.

## Pushing and GitHub sync

### Publish the monorepo to GitHub

The monorepo is already connected locally to
`git@github.com:saksham801/saksham-monorepo.git`. Verify it with:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo
git remote -v
```

After committing local changes, push with:

```bash
git add <files-you-changed>
git commit -m "describe the change"
git push origin main
```

GitHub Actions runs CI checks. Cloudflare Workers Builds then deploys only the
Worker(s) whose repository watch paths match the pushed changes and whose
production branch is `main`. See the configuration and cutover instructions
above. This does **not** update the three old GitHub repositories.

### About the three existing GitHub repositories

This monorepo is **not automatically synchronized** with
`saksham801/portfolio`, `saksham801/docs`, or `saksham801/blogs`. Do not add
those repositories as `origin`, and do not push `main`, `--all`, tags, or use
`--force` to them. Their Git histories and root directory structures differ
from the monorepo. In addition, each app now depends on `@saksham/ui` through
the Bun workspace (`"workspace:*"`); copying just `apps/<app>` into an old
standalone repository would not provide that package or necessarily build.

The old repositories remain intact as a rollback/source-history reference.
Whether an old repository or the monorepo is currently the deployment source
for a Worker is determined by that Worker's Cloudflare **Settings → Builds**
Git connection; verify it in the dashboard. A push only auto-deploys from the
monorepo after that Worker is connected to
`saksham801/saksham-monorepo` and its root, branch, commands, and watch paths
are configured as described in
[Cloudflare Workers Builds from the monorepo](#cloudflare-workers-builds-from-the-monorepo).

If the old GitHub repositories must receive code while remaining standalone,
first create an app-specific export that includes or otherwise resolves the
shared `@saksham/ui` dependency, and validate it with that repository's
standalone install/build. Submit that export as a **new branch and pull
request**, never directly to its production branch. This repo does not yet
provide an export/sync script; do not assume a raw subtree push is compatible.

## CI behavior

`.github/workflows/ci.yml` runs install, lint, typecheck, and builds on relevant
pull requests and pushes to `main`. It does not deploy. Once configured, each
Cloudflare Workers Builds connection separately deploys its Worker from
monorepo pushes on `main` when that Worker's watch paths match. Require the CI
check in GitHub branch protection so unvalidated changes cannot be merged to
the production branch.

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
6. Run `bun run cf-typegen`, `bun run build`, and
   `bunx wrangler deploy --dry-run` in the app for deployment validation. Do
   not publish until the production account, Worker configuration, and
   approval are confirmed.
