---
title: Engineering toolbox
description: The tools and defaults behind these notes.
---

## Stack

| Area | Default |
| --- | --- |
| UI | Astro, React, Tailwind CSS |
| Language | TypeScript |
| Runtime | Node.js |
| Data | PostgreSQL, SQLite, Redis |
| Hosting | Cloudflare |

## Definition of done

Before calling a feature complete:

- The primary user flow works on a narrow screen and a wide screen.
- Loading, empty, error, and success states are intentional.
- Inputs are validated at the boundary.
- Logs and health checks make failures diagnosable.
- The production build succeeds from a clean install.
- The README explains setup, environment variables, and deployment.

## Useful commands

```bash
# Install dependencies
bun install

# Run locally
bun dev

# Build the production site
bun run build

# Preview the production build
bun run preview
```
