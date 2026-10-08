// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://sakshampy.in',
	output: 'server',
	integrations: [mdx()],
	adapter: cloudflare({ inspectorPort: 9230 }),
	vite: {
		plugins: [tailwindcss()],
	},
});
