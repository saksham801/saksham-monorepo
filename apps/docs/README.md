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
| `bun run deploy` | Build and deploy with Wrangler |

Deployment is configured for Cloudflare in `wrangler.jsonc`. Set the
`CLOUDFLARE_API_TOKEN` and account configuration in your deployment
environment rather than committing credentials.
