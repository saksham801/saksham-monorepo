# Tooling

Bun 1.4.3 is the package manager/runtime and Turborepo 2.11.10 orchestrates workspace tasks. Tool versions are pinned in the root `package.json` and `bun.lock`.

## Tool responsibilities

- **Linting:** Oxlint is primary for JavaScript and TypeScript (`.oxlintrc.json`). ESLint with `eslint-plugin-astro` remains for `.astro` files, whose component-aware lint rules are not replaced by Oxlint here. Oxlint enables correctness errors and suspicious warnings; generated Worker declarations are excluded.
- **Formatting:** Oxfmt is the formatter (`.oxfmtrc.json`). It formats Astro through `@astrojs/compiler-rs` and MDX/HTML through Oxfmt's bundled Prettier integration. Formatting changes were applied once during migration; CI uses non-mutating `format:check`. `packages/ui/src/components/ErrorPage.astro` is excluded because Oxfmt 0.74 rewrites its conditional `<script>` into syntax rejected by Astro's ESLint parser; ESLint and Astro checks still validate that file.
- **Authoritative type checks:** `astro check` remains authoritative for the Astro apps and `tsc` remains authoritative for the shared UI package.
- **Experimental type checks:** `tsrs` 0.18.0 is an experimental, TypeScript 7.1-dev Rust port while this repository uses TypeScript 6.0.3. It is exposed as `typecheck:tsrs` only; it does not check Astro templates and is not a CI gate or replacement for Astro/TypeScript checks.
- **Builds:** Existing per-app Astro production build commands remain unchanged. Turbo caches successful deterministic tasks; `format` and autofix lint tasks are deliberately not cached. Build tasks keep their existing generated output declarations and dependencies.

## Commands

From the repository root:

```sh
bun install --frozen-lockfile
bun run lint
bun run lint:fix
bun run format
bun run format:check
bun run typecheck
bun run typecheck:tsrs  # experimental only
bun run build
bun run check
```

Run one app with Turbo filters:

```sh
bunx turbo run lint format:check typecheck build --filter=portfolio
bunx turbo run lint format:check typecheck build --filter=blogs
bunx turbo run lint format:check typecheck build --filter=docs
```

The repository also contains a `report` app. Root builds include it, but report does not yet declare lint, format, or typecheck scripts. It depends on `@saksham/ui` for shared components and is therefore included in the workspace build dependency graph.

## Cache behavior

Turbo hashes the Bun lockfile, shared TypeScript config, lint/format configs, and each task's package inputs. Lint, format checks, type checks, and builds are cacheable when their inputs match. `format` writes files and `lint:fix` mutates files, so both always execute. Experimental `typecheck:tsrs` has its own task key and does not reuse the authoritative typecheck cache.

## Safe upgrades

Update tooling with Bun, commit the lockfile changes, then run lint, format check, authoritative checks, production builds, and the optional tsrs comparison. Review Oxfmt's diff before applying formatting to changed application content. Keep Astro/TypeScript checks authoritative until tsrs supports and passes the repository's framework-specific checks and its TypeScript-version gap is resolved.
