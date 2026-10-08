// Routes checked against src/pages, content collections and Starlight sidebar.
// Origins remain configurable because these Astro apps deploy independently.
const blogSlugs = [
  'cloudflare-workers-production-architecture', 'cpp-coroutines-executors',
  'cpp-raii-smart-pointers', 'python-asyncio-structured-concurrency',
  'python-packaging-reproducible-services', 'rust-error-handling-production',
  'rust-ownership-borrowing',
];
const docsPaths = [
  '/docs/', '/docs/guides/about/', '/docs/reference/toolbox/', '/docs/languages/rust/',
  '/docs/languages/rust/ownership/', '/docs/languages/rust/tooling/', '/docs/languages/cpp/',
  '/docs/languages/cpp/memory/', '/docs/languages/cpp/tooling/', '/docs/languages/python/',
  '/docs/languages/python/packaging/', '/docs/languages/python/tooling/', '/docs/terms/',
];

export const routeGroups = {
  portfolio: [
    { path: '/', type: 'homepage' }, { path: '/health', type: 'health' },
    { path: '/terms', type: 'static' },
  ],
  blogs: [
    { path: '/blogs/', type: 'listing' },
    { path: '/blogs/about/', type: 'static' }, { path: '/blogs/terms/', type: 'static' },
    ...blogSlugs.map((slug) => ({ path: `/blogs/${slug}/`, type: 'blog' })),
  ],
  docs: docsPaths.map((path) => ({ path, type: path === '/docs/' ? 'homepage' : 'docs' })),
};

export const apiRoutes = [{ app: 'portfolio', path: '/api/openstatus', method: 'GET', type: 'api' }];

export function originFor() {
  return __ENV.BASE_URL.replace(/\/$/, '');
}

export function allRoutes() {
  return Object.entries(routeGroups).flatMap(([app, routes]) => routes.map((route) => ({ ...route, app })));
}
