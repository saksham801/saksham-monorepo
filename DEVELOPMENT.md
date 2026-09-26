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

The existing deploy script performs a real deployment. Use it for a manually
triggered deployment only after verifying the intended Cloudflare account,
credentials, Worker settings, and production approval:

```bash
cd /home/saksham/blogs.sakshampy.in/monorepo/apps/portfolio
bun run deploy
```

Use the same command from `apps/docs` or `apps/blogs` to deploy that specific
app. For normal Git pushes, Cloudflare Workers Builds should build and deploy
the matching app from the monorepo using the settings below. The build
connection lives in Cloudflare, not in this repository, so verify each
Worker's Git repository and settings in the Cloudflare dashboard. Never change
DNS, domains, or Worker ownership as part of normal local development.

### First-time manual deployment checklist

This sequence deploys only the selected app's Worker. It is not a substitute
for confirming that the existing Cloudflare Worker, custom domain, bindings,
and account are the intended production targets.

1. Confirm the monorepo is pushed to `saksham801/saksham-monorepo` and the CI
   check passes on `main`. Configure GitHub branch protection to require the
   CI check before merging pull requests into `main`; Cloudflare's production
   branch must also be `main`.
2. In Cloudflare, verify the account and existing Worker (`saksham`, `docs`, or
   `blogs`) that currently serves the intended production URL. Confirm the
   custom domain, Worker bindings, production variables/secrets, Git
   connection, and current deployment before changing its source repository
   or build settings. Keep the old GitHub repository and its last working
   commit for rollback.
3. For a local CLI deployment, authenticate and check the account:

   ```bash
   cd /home/saksham/blogs.sakshampy.in/monorepo
   bunx wrangler login
   bunx wrangler whoami
   ```

   If `whoami` reports the wrong account, stop. Do not deploy.
4. Build and dry-run only the intended Worker, from its app directory:

   ```bash
   cd /home/saksham/blogs.sakshampy.in/monorepo/apps/portfolio
   bun run build
   bunx wrangler deploy --dry-run
   ```

   Replace `portfolio` with `docs` or `blogs` to validate those Workers.
   Review Wrangler's output for the expected Worker name and bindings. A dry
   run does not publish.
5. Only after preview/staging checks and explicit production approval, deploy
   that one app:

   ```bash
   cd /home/saksham/blogs.sakshampy.in/monorepo/apps/portfolio
   bun run deploy
   ```

   The script runs `astro build && wrangler deploy` using that app's
   `wrangler.jsonc`. Repeat separately for the other apps only when approved.
   Do not deploy all three together for the first cutover.
6. Smoke-test the app's production homepage and important routes/assets, check
   Worker logs and errors, and verify the old deployment can still be restored.
   Do not delete the old repository or change DNS as a rollback shortcut.

Portfolio configuration uses the existing Worker name `saksham`. Before the
first deployment, set `OPENSTATUS_API_KEY` as a **secret** on that Worker using
Cloudflare's secret settings (or `bunx wrangler secret put OPENSTATUS_API_KEY`
from `apps/portfolio` after verifying the account). Set
`OPENSTATUS_MONITOR_ID` as a non-secret Worker variable in that same Worker's
settings. The repository deliberately does not contain either production value.
Check and preserve any other existing production bindings/settings in the
Cloudflare dashboard; do not infer values from the local example.

### Cloudflare Workers Builds from the monorepo

Configure **three separate existing Worker projects** against the same
monorepo repository. Each Worker gets its own build settings, production
branch, and path filters. Do not create one Worker for all three apps. Cloudflare
Workers Builds has a build step followed by a deploy step; the build command
uses Turbo to produce the app's `dist/`, and the deploy command runs Wrangler
with that app's `wrangler.jsonc`.

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

| Setting | Portfolio Worker `saksham` | Docs Worker `docs` | Blogs Worker `blogs` |
| --- | --- | --- | --- |
| Git repository | `saksham801/saksham-monorepo` | `saksham801/saksham-monorepo` | `saksham801/saksham-monorepo` |
| Root directory | Repository root (`.` or `/`) | Repository root (`.` or `/`) | Repository root (`.` or `/`) |
| Production branch | `main` | `main` | `main` |
| Build command | `bun install --frozen-lockfile && bunx turbo build --filter=portfolio` | `bun install --frozen-lockfile && bunx turbo build --filter=docs` | `bun install --frozen-lockfile && bunx turbo build --filter=blogs` |
| Deploy command | `cd apps/portfolio && bunx wrangler deploy` | `cd apps/docs && bunx wrangler deploy` | `cd apps/blogs && bunx wrangler deploy` |
| Preview command (if previews enabled) | `cd apps/portfolio && bunx wrangler preview` | `cd apps/docs && bunx wrangler preview` | `cd apps/blogs && bunx wrangler preview` |

**Use the repository root.** The apps depend on `@saksham/ui` through Bun
workspaces and the single root `bun.lock`. Do not set the Cloudflare root
directory to `apps/<app>`: a root install from inside an app would not have
the complete workspace context. The build command starts at the repository
root; the deploy/preview commands change to the app directory so Wrangler
loads its own configuration and relative `dist` path.

In the Cloudflare build settings, use the workspace install/build command
above as the **Build command** and the app-specific Wrangler command as the
**Deploy command**. Do not make the deploy command `bun run deploy` in this
two-step setup: the app's script builds Astro again, even though Turbo already
created `dist/` in the build step. Cloudflare Workers Builds can create its
deployment token automatically; do not paste a Cloudflare token into this
repository or a committed workflow.

Verify Workers Builds can run the Bun version pinned in the root
`package.json` (`bun@1.4.2`) and that its package installation uses the root
`bun.lock`. If the Cloudflare build environment cannot run this workspace,
stop and configure a supported Bun setup before enabling deployments. Do not
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

Do not add the other apps' paths to a Worker. App-local changes deploy only
that app; a shared UI or root workspace/build config change deploys all three.
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
| `packages/ui/**` or a listed root workspace/build file | All three |
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
6. Use Wrangler dry run for deployment bundle validation. Do not publish until
   production account/configuration and approval are confirmed.
