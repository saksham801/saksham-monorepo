// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://sakshampy.in',
  output: 'static',
  adapter: cloudflare({ inspectorPort: 9232 }),
  vite: {
    plugins: [tailwindcss()]
  }
});