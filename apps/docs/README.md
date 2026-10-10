# Saksham's Docs

Production documentation and self-notes for Saksham Dubey, built with Astro,
Starlight, and Tailwind CSS.

## Project structure

```text
.
├── public/
├── src/content/docs/   # Markdown and MDX documentation
├── src/styles/docs.css  # Site theme and Tailwind entrypoint
├── astro.config.mjs
├── package.json
└── wrangler.jsonc
```

## Commands

| Command | Action |
| --- | --- |
| `bun install` | Install dependencies |
| `bun dev` | Start the local site at `localhost:4321` |
| `bun run build` | Build the production site to `./dist/` |
| `bun run preview` | Preview the production build |
| `bun run deploy` | Deploy the existing Turbo build with Wrangler |

Run `bunx turbo build --filter=docs` from the monorepo root before deploying.
The deploy script uses Astro's generated Wrangler configuration in `dist/`
and does not rebuild. Deployment is configured for Cloudflare in
`wrangler.jsonc`. Set `CLOUDFLARE_API_TOKEN` and account configuration in
your deployment environment rather than committing credentials.
