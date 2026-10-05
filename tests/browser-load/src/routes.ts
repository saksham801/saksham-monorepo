import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appForUrl, bases, type AppName, type RouteDefinition, type RouteType } from './config.js';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const routeType = (path: string, app: AppName): RouteType => {
  if (path === '/') return 'homepage';
  if (app === 'docs') return 'documentation';
  if (/\/blog\/$/.test(path)) return 'listing';
  if (/\/blog\/[^/]+/.test(path)) return 'article';
  if (/about/.test(path)) return 'about';
  if (/contact/.test(path)) return 'contact';
  if (/project/.test(path)) return 'project';
  if (/search/.test(path)) return 'search';
  return 'other';
};
const fromFile = (app: AppName, filepath: string): string | undefined => {
  const normalized = filepath.replaceAll('\\', '/');
  const pageRoot = app === 'docs' ? 'src/content/docs/' : 'src/pages/';
  const start = normalized.indexOf(pageRoot);
  if (start < 0) return undefined;
  let rel = normalized.slice(start + pageRoot.length);
  const ext = extname(rel);
  if (ext === '.md' || ext === '.mdx') rel = rel.slice(0, -ext.length);
  else if (ext === '.astro' || ext === '.js' || ext === '.ts') rel = rel.slice(0, -ext.length);
  else return undefined;
  if (rel === '404' || rel === 'api/openstatus' || rel === 'rss.xml') return undefined;
  if (rel === 'index') return '/';
  rel = rel.replace(/\[\.\.\.(.+?)\]/g, '').replace(/\[(.+?)\]/g, '');
  if (!rel) return '/';
  return `/${rel.replace(/\/index$/, '')}/`.replaceAll('//', '/');
};
async function walk(dir: string): Promise<string[]> {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return []; }
  const nested = await Promise.all(entries.map((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
  return nested.flat();
}
export async function discoverRoutes(crawl = true): Promise<RouteDefinition[]> {
  const found = new Map<string, RouteDefinition>();
  for (const app of ['portfolio', 'docs', 'blogs'] as const) {
    const files = await walk(resolve(root, `apps/${app}`));
    for (const file of files) {
      if (file.includes('/node_modules/') || file.includes('/dist/') || file.includes('/.astro/')) continue;
      const path = fromFile(app, relative(resolve(root, `apps/${app}`), file));
      if (path) add(app, path);
    }
    if (app === 'blogs') {
      for (const file of await walk(resolve(root, 'apps/blogs/src/content/blog'))) {
        if (!['.md', '.mdx'].includes(extname(file))) continue;
        add(app, `/blog/${file.split('/').at(-1)!.replace(/\.mdx?$/, '')}/`, 'article');
      }
    }
  }
  if (crawl) {
    for (const app of ['portfolio', 'docs', 'blogs'] as const) {
      const base = bases[app];
      try {
        const robots = await fetch(new URL('/robots.txt', base), { signal: AbortSignal.timeout(5000) }).then((r) => r.text());
        const sitemapPaths = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1]!);
        for (const sitemapUrl of sitemapPaths) await scanSitemap(sitemapUrl, app, add);
        await crawlLinks(new URL('/', base).href, app, add);
      } catch (error) { console.warn(`[routes] live discovery unavailable for ${app}: ${String(error)}`); }
    }
  }
  return [...found.values()].sort((a, b) => a.app.localeCompare(b.app) || a.path.localeCompare(b.path));
  function add(app: AppName, path: string, forced?: RouteType) {
    const normalizedPath = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`;
    if (/\.(?:txt|xml|rss|json|pdf|png|jpe?g|svg|ico|css|js|woff2?)$/i.test(normalizedPath.replace(/\/$/, '')) || normalizedPath.startsWith('/cdn-cgi/')) return;
    const url = new URL(normalizedPath, bases[app]).href;
    const key = `${app}:${normalizedPath}`;
    found.set(key, { app, url, path: normalizedPath, type: forced ?? routeType(normalizedPath, app) });
  }
}
async function scanSitemap(url: string, app: AppName, add: (app: AppName, path: string) => void) {
  try {
    const text = await fetch(url, { signal: AbortSignal.timeout(5000) }).then((r) => r.text());
    for (const [, value] of text.matchAll(/<loc>(.*?)<\/loc>/g)) {
      const target = new URL(value!.trim());
      if (appForUrl(target.href) === app) add(app, target.pathname);
      else if (target.pathname.endsWith('sitemap.xml') || target.pathname.endsWith('sitemap-index.xml')) await scanSitemap(target.href, app, add);
    }
  } catch (error) { console.warn(`[routes] sitemap unavailable ${url}: ${String(error)}`); }
}
async function crawlLinks(seed: string, app: AppName, add: (app: AppName, path: string) => void) {
  const queue = [seed]; const seen = new Set<string>();
  while (queue.length && seen.size < 100) {
    const url = queue.shift()!; if (seen.has(url)) continue; seen.add(url);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) continue;
      add(app, new URL(response.url).pathname);
      const html = await response.text();
      for (const [, href] of html.matchAll(/\bhref=["']([^"'#]+)["']/gi)) {
        try {
          const next = new URL(href!, response.url);
          if (appForUrl(next.href) !== app || !['http:', 'https:'].includes(next.protocol)) continue;
          if (/\\.(?:txt|png|jpe?g|svg|css|js|pdf|xml|rss|json|ico|woff2?)$/i.test(next.pathname) || next.pathname.startsWith('/cdn-cgi/')) continue;
          const clean = `${next.origin}${next.pathname}`;
          add(app, next.pathname); if (!seen.has(clean)) queue.push(clean);
        } catch { /* malformed hrefs are surfaced by browser requests, not route discovery */ }
      }
    } catch { /* each site is independently best-effort */ }
  }
}
if (import.meta.main) {
  const routes = await discoverRoutes(true);
  const output = resolve(root, 'tests/browser-load/reports/routes.json');
  await mkdir(resolve(root, 'tests/browser-load/reports'), { recursive: true });
  await writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2)}\n`);
  console.info(`Discovered ${routes.length} routes → ${output}`);
}
