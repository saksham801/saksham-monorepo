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
      logo: {
        src: './src/assets/logo.svg',
        alt: 'SD — Saksham’s Docs',
      },
      customCss: ['./src/styles/docs.css'],
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'author',
            content: 'Saksham Dubey',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'robots',
            content: 'index, follow, max-image-preview:large',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:site_name',
            content: 'Saksham’s Docs',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:locale',
            content: 'en_IN',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#090b0d',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'alternate',
            type: 'text/plain',
            href: '/llms.txt',
            title: 'LLM-friendly documentation index',
          },
        },
        {
          tag: 'script',
          attrs: {
            type: 'application/ld+json',
          },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Saksham’s Docs',
            description: 'Working notes, engineering guides, and practical references by Saksham Dubey.',
            url: 'https://docs.sakshampy.in/',
            author: {
              '@type': 'Person',
              name: 'Saksham Dubey',
              url: 'https://sakshampy.in/',
            },
            inLanguage: 'en-IN',
          }),
        },
      ],
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
          items: [
            { autogenerate: { directory: 'reference' } },
          ],
        },
        {
          label: 'Languages',
          items: [
            {
              label: 'Rust',
              items: [
                { label: 'Overview', slug: 'languages/rust' },
                { autogenerate: { directory: 'languages/rust' } },
              ],
            },
            {
              label: 'C++',
              items: [
                { label: 'Overview', slug: 'languages/cpp' },
                { autogenerate: { directory: 'languages/cpp' } },
              ],
            },
            {
              label: 'Python',
              items: [
                { label: 'Overview', slug: 'languages/python' },
                { autogenerate: { directory: 'languages/python' } },
              ],
            },
          ],
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