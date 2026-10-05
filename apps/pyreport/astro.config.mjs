// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'never',
  adapter: cloudflare({ inspectorPort: 9234 })
});