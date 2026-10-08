// Routes checked against src/pages, content collections and Starlight sidebar.
// Origins remain configurable because these Astro apps deploy independently.
const blogSlugs = [
  'cloudflare-workers-production-architecture', 'cpp-coroutines-executors',
  'cpp-raii-smart-pointers', 'python-asyncio-structured-concurrency',
  'python-packaging-reproducible-services', 'rust-error-handling-production',
  'rust-ownership-borrowing',
];
const docsPaths = [
  '/', '/guides/about/', '/reference/toolbox/', '/languages/rust/',
  '/languages/rust/ownership/', '/languages/rust/tooling/', '/languages/cpp/',
  '/languages/cpp/memory/', '/languages/cpp/tooling/', '/languages/python/',
  '/languages/python/packaging/', '/languages/python/tooling/', '/terms/',
];

export const routeGroups = {
  portfolio: [
    { path: '/', type: 'homepage' }, { path: '/health', type: 'health' },
    { path: '/terms', type: 'static' },
  ],
  blogs: [
    { path: '/', type: 'homepage' }, { path: '/blog/', type: 'listing' },
    { path: '/about', type: 'static' }, { path: '/terms', type: 'static' },
    ...blogSlugs.map((slug) => ({ path: `/blog/${slug}/`, type: 'blog' })),
  ],
  docs: docsPaths.map((path) => ({ path, type: path === '/' ? 'homepage' : 'docs' })),
};

export const apiRoutes = [{ app: 'portfolio', path: '/api/openstatus', method: 'GET', type: 'api' }];

export function originFor(app) {
  const configured = __ENV[`${app.toUpperCase()}_URL`];
  if (configured) return configured.replace(/\/$/, '');
  if (app === 'portfolio') return __ENV.BASE_URL.replace(/\/$/, '');
  return __ENV.BASE_URL.replace(/\/$/, '');
}

export function allRoutes() {
  return Object.entries(routeGroups).flatMap(([app, routes]) => routes.map((route) => ({ ...route, app })));
}
