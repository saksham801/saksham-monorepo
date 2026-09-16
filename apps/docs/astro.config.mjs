// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.sakshampy.in',
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['@bruits/satteri-wasm32-wasi'],
      },
    },
  },
  integrations: [
    starlight({
      title: 'Saksham’s Docs',
      description: 'Working notes, engineering guides, and practical references by Saksham Dubey.',
      customCss: ['./src/styles/docs.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/saksham-dubey' },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Home', slug: '' },
            { label: 'About these notes', slug: 'guides/about' },
          ],
        },
        {
          label: 'Guides',
          items: [{ autogenerate: { directory: 'guides' } }],
        },
        {
          label: 'Reference',
          items: [{ autogenerate: { directory: 'reference' } }],
        },
      ],
    }),
  ],
  adapter: cloudflare({
    // Keep Astro's local dev renderer on Node. The docs are static at build
    // time, while workerd's dev runner cannot execute Vite's CommonJS shims.
    prerenderEnvironment: 'node',
  }),
});