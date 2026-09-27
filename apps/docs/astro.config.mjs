// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.sakshampy.in',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true,
      rollupOptions: {
        external: ['@bruits/satteri-wasm32-wasi'],
        onwarn(warning, defaultHandler) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            warning.message.includes('"use astro:head-inject"')
          ) {
            return;
          }
          defaultHandler(warning);
        },
      },
    },
  },
  integrations: [
    starlight({
      title: 'Saksham’s Docs',
      description:
        'Working notes, engineering guides, and practical references by Saksham Dubey — full stack engineer in New Delhi.',
      favicon: '/favicon.svg',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'SD — Saksham’s Docs',
      },
      components: {
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
        PageTitle: './src/components/PageTitle.astro',
      },
      customCss: ['./src/styles/docs.css'],
      lastUpdated: true,
      pagination: true,
      pagefind: true,
      tableOfContents: true,
      disable404Route: true,
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: 'anonymous',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap',
          },
        },
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
            content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'keywords',
            content:
              'Saksham Dubey, engineering docs, software guides, Rust, C++, Python, full stack, New Delhi',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:type',
            content: 'website',
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
            name: 'twitter:card',
            content: 'summary',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:title',
            content: 'Saksham’s Docs',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:description',
            content:
              'Working notes, engineering guides, and practical references by Saksham Dubey.',
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
            '@graph': [
              {
                '@type': 'WebSite',
                name: 'Saksham’s Docs',
                url: 'https://docs.sakshampy.in/',
                description:
                  'Working notes, engineering guides, and practical references by Saksham Dubey.',
                inLanguage: 'en-IN',
                publisher: {
                  '@type': 'Person',
                  name: 'Saksham Dubey',
                  url: 'https://sakshampy.in/',
                  email: 'mailto:hello@sakshampy.in',
                },
              },
              {
                '@type': 'TechArticle',
                headline: 'Saksham’s Docs',
                description:
                  'Working notes, engineering guides, and practical references by Saksham Dubey.',
                url: 'https://docs.sakshampy.in/',
                author: {
                  '@type': 'Person',
                  name: 'Saksham Dubey',
                  url: 'https://sakshampy.in/',
                },
                inLanguage: 'en-IN',
              },
            ],
          }),
        },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/saksham-dubey' },
        { icon: 'external', label: 'Portfolio', href: 'https://sakshampy.in/' },
      ],
      sidebar: [
        {
          label: 'Documentation',
          items: [
            { label: 'Welcome', slug: 'index' },
            { label: 'About these notes', slug: 'guides/about' },
            { label: 'Engineering toolbox', slug: 'reference/toolbox' },
          ],
        },
        {
          label: 'Rust',
          items: [
            { label: 'Overview', slug: 'languages/rust' },
            { label: 'Ownership', slug: 'languages/rust/ownership' },
            { label: 'Tooling', slug: 'languages/rust/tooling' },
          ],
        },
        {
          label: 'C++',
          items: [
            { label: 'Overview', slug: 'languages/cpp' },
            { label: 'Memory', slug: 'languages/cpp/memory' },
            { label: 'Tooling', slug: 'languages/cpp/tooling' },
          ],
        },
        {
          label: 'Python',
          items: [
            { label: 'Overview', slug: 'languages/python' },
            { label: 'Packaging', slug: 'languages/python/packaging' },
            { label: 'Tooling', slug: 'languages/python/tooling' },
          ],
        },
        { label: 'Terms and Conditions', slug: 'terms' },
      ],
    }),
  ],
  adapter: cloudflare({
    inspectorPort: 9231,
    // Keep Astro's local dev renderer on Node. The docs are static at build
    // time, while workerd's dev runner cannot execute Vite's CommonJS shims.
    prerenderEnvironment: 'node',
  }),
});
