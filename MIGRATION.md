# Migration manifest and safety record

## Source state

The original application repositories were clean at their recorded local
commits. GitHub's current `docs/main` had advanced beyond the local clone, so
the candidate imports that verified remote tip while retaining the local
branches as history references.

| App | Source repository | Local pre-migration commit | Imported source commit | Branches/tags | Production URL |
| --- | --- | --- | --- | --- | --- |
| Blogs | `git@github.com:saksham801/blogs.git` | `e11327de2fac2b9e505c5e06f00dda015fe4c41d` | `e11327de2fac2b9e505c5e06f00dda015fe4c41d` | `main`; no tags | <https://blogs.sakshampy.in> |
| Docs | `https://github.com/saksham801/docs.git` | `a7456d1fe553e45f04226005ee14e078e0188830` | `c4d91b8e19276646fc33d27b8869f6333376e218` | `main`; local `backup/main-before-9ee1bc56`; no tags | <https://docs.sakshampy.in> |
| Portfolio (`saksham`) | `git@github.com:saksham801/portfolio.git` | `cb033c634e1b5b6a772c4f902d7caae396cba1a4` | `cb033c634e1b5b6a772c4f902d7caae396cba1a4` | `main`; no tags | <https://sakshampy.in> |

The latest Docs remote commit descends from the local `main` commit. Its local
backup branch diverges at `9ee1bc5` and is retained under an archival branch in
the monorepo. The original repository clones remain unchanged and available.

## Backups

Verified bare Git mirrors, including all locally available branches and tags,
are stored outside the candidate repository at:

`/home/saksham/.copilot/session-state/0b14d686-6554-4b5d-8f96-6eb4f2a1d62e/files/migration-backups/`

`MANIFEST.md` in that directory records the source paths, remote URLs, commits,
branches, tags, production URLs, Wrangler paths, and env-var names. `git fsck`
passed for all three mirrors. A separate `docs-remote.git` mirror records the
newer Docs remote tip plus the fetched local branches. No secret values are in
the manifest or this repository.

## Git-history method

For the isolated dry run, each source repository was cloned to a temporary
workspace and `git filter-branch --tree-filter` moved every commit's tracked
tree below `apps/<name>/`. It preserves commit ancestry, authors, timestamps,
and messages while necessarily rewriting commit IDs for the changed trees.
Each transformed `main` is merged into the monorepo root; the divergent Docs
backup branch is kept as an archival branch. There are no tag-name collisions
because no source repository has tags. No nested `.git` directories are copied
into the app directories.

The final local monorepo retains local `archive/*` branches for every imported
app main and both Docs local branches. It has no Git remote configured; create
a new monorepo remote separately after review. Never push this migration over
one of the existing production repositories.

## Deployment and environment ownership

- `apps/portfolio` keeps Worker `saksham`, `wrangler.jsonc`, and its
  `OPENSTATUS_API_KEY` secret / `OPENSTATUS_MONITOR_ID` variable.
- `apps/docs` keeps Worker `docs` and its own `wrangler.jsonc`.
- `apps/blogs` keeps Worker `blogs` and its own `wrangler.jsonc`.
- The checked-out repositories have no GitHub Actions workflows. No deployment
  workflow, account ID, credential, or custom-domain configuration was
  inferred or changed. CI checks only; production deploy remains manual.
- No `.dev.vars` values or production secrets were copied.
- Current GitHub Docs main had `pagefind: false`; the monorepo candidate enables
  Starlight Pagefind and its header search control to satisfy the requested
  Docs search UX. Its search index and Wrangler dry run pass, but this addition
  has not been deployed to production.

## Dry-run and local validation

The initial inventory confirmed separate Astro projects and independent
Cloudflare Worker names. The dry run imports only source files and history into
an isolated candidate; it does not push, deploy, modify DNS, change secrets, or
alter the original clones.

### DRY RUN RESULT

```text
Git migration: PASS
Bun workspace: PASS
Turbo build: PASS
Portfolio build: PASS
Docs build: PASS
Blogs build: PASS
Shared UI: PASS
Cloudflare build: PASS
CI/CD: FAIL (checks pass; no safe production deployment workflow could be inferred)
Rollback readiness: PASS
```

| Check | Result | Evidence |
| --- | --- | --- |
| Git migration | PASS | All three histories imported below `apps/`; Docs backup and local-main branches retained under `archive/docs/*`. |
| Bun workspace | PASS | `bun install --frozen-lockfile`; one root `bun.lock`, no nested Git repos or alternate lockfiles. |
| Turbo build/cache | PASS | All lint/typecheck/build tasks passed; repeat builds hit cache. Changing the UI token invalidated all dependent app builds. |
| Portfolio build | PASS | Astro production build and `wrangler deploy --dry-run`. |
| Docs build | PASS | Astro/Pagefind production build and `wrangler deploy --dry-run`. |
| Blogs build | PASS | Astro production build and `wrangler deploy --dry-run`. |
| Shared UI | PASS | Shared design tokens consumed by all apps; shared `FormattedDate` consumed by Blogs. |
| CI checks | PASS | The workflow's install/lint/typecheck/build command passed locally. |
| Production deploy automation | BLOCKED | No prior GitHub Actions workflow exists, and Cloudflare account/credential/domain settings are not present to verify. No deploy workflow was guessed. |
| Rollback readiness | PASS | Original clean clones and verified local/remote Git mirrors remain available. |

Read-only HTTP HEAD checks on 2026-09-26 returned `200` for each production
homepage and one representative route (`/health/`, `/guides/about/`, and
`/blog/`). No candidate code was deployed.

The local Bun installation was 1.4.2. It generated the final lockfile with
current compatible dependency versions; the package ranges retain each app's
previous version intent and Astro integrations.

Final-clone verification exposed an intermittent Astro generated-state race
when `astro check` and `astro build` ran concurrently inside the same app.
Turbo now makes each app's `build` depend on its own `typecheck`, preventing
the two Astro processes from writing generated state simultaneously. After this
ordering fix, frozen install, all workspace checks/builds, and all three
filtered builds passed in the final monorepo clone. Wrangler dry runs passed for
each Worker.

Pagefind is the one deliberate Docs behavior addition relative to current
GitHub `docs/main`, which explicitly disabled it. It is included because search
is requested for the monorepo Docs UX; production remains unchanged until an
owner-approved preview and cutover.

## Rollback

1. Do not delete or archive the three original GitHub repositories.
2. Keep the existing Cloudflare Workers, secrets, and domains active.
3. Do not point production at this monorepo until preview and smoke checks pass.
4. Revert the monorepo migration commit(s), or restore a source repository from
   its bare mirror and recorded commit if necessary.
5. Restore the previous per-app CI/deployment configuration if one is later
   discovered; none was present in the checked-out repositories.
6. Verify each production URL and compare the app source against the recorded
   pre-migration commit (or the recorded current Docs remote head).
