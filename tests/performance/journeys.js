import http from 'k6/http';
import { check, sleep } from 'k6';
import { routeGroups, originFor } from './config/routes.js';
import { choose, integer } from './utils/random.js';
import {
  successfulPages, failedPages, successfulBlogReads, successfulDocsReads,
  httpErrors, status2xx, status3xx, status4xx, status5xx, timeoutErrors, responseBytes, cacheResponses,
  routeVisits, routeErrors, routeDuration, routeMetrics, journeysStarted, journeysCompleted, journeysFailed,
  homepageDuration, blogDuration, docsDuration, projectDuration, apiDuration,
  readingDuration, navigationDuration,
} from './utils/metrics.js';

const appRoutes = Object.fromEntries(Object.entries(routeGroups).map(([app, routes]) => [
  app, routes.map((route) => ({ ...route, app, url: `${originFor(app)}${route.path}` })),
]));
const devices = ['desktop', 'desktop', 'desktop', 'desktop', 'desktop', 'desktop', 'desktop', 'mobile', 'mobile', 'mobile'];
const thinkTimeScale = Number(__ENV.THINK_TIME_SCALE || 1);
const personas = ['casual', 'blog', 'docs', 'developer', 'random'];
const params = (route, persona, device) => ({
  tags: { route: route.path, app: route.app, page_type: route.type, persona, device, cache_mode: __ENV.CACHE_MODE || 'warm' },
  headers: { 'User-Agent': device === 'mobile' ? 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36' },
  timeout: __ENV.REQUEST_TIMEOUT || '30s', redirects: 5,
});

function visit(route, persona, device) {
  const started = Date.now();
  const response = http.get(route.url, params(route, persona, device));
  const elapsed = Date.now() - started;
  const ok = check(response, { 'page responds successfully': (r) => r.status >= 200 && r.status < 400 });
  const tags = { route: route.path, app: route.app, page_type: route.type, persona, device, status: String(response.status) };
  const routeTags = { route: route.path, app: route.app, page_type: route.type };
  routeVisits.add(1, routeTags);
  routeDuration.add(elapsed, routeTags);
  const perRoute = routeMetrics[`${route.app}:${route.path}`];
  perRoute?.visits.add(1);
  perRoute?.duration.add(elapsed);
  if (response.status >= 200 && response.status < 300) status2xx.add(1, tags);
  else if (response.status >= 300 && response.status < 400) status3xx.add(1, tags);
  else if (response.status >= 400 && response.status < 500) status4xx.add(1, tags);
  else if (response.status >= 500) status5xx.add(1, tags);
  else if (response.status === 0) timeoutErrors.add(1, tags);
  if (response.body) responseBytes.add(response.body.length, tags);
  const cacheHeader = response.headers['Cf-Cache-Status'] || response.headers['CF-Cache-Status'] || response.headers['X-Cache'] || 'unknown';
  const cacheValue = String(cacheHeader).toLowerCase();
  const cacheStatus = cacheValue.includes('hit') ? 'hit' : cacheValue.includes('miss') ? 'miss' : cacheValue === 'unknown' ? 'unknown' : 'other';
  cacheResponses.add(1, { ...tags, cache_status: cacheStatus });
  if (ok) {
    successfulPages.add(1, tags);
    if (route.type === 'blog') successfulBlogReads.add(1, tags);
    if (route.type === 'docs') successfulDocsReads.add(1, tags);
  } else {
    failedPages.add(1, tags);
    routeErrors.add(1, routeTags);
    perRoute?.errors.add(1);
    if (response.status >= 400 || response.status === 0) httpErrors.add(1, tags);
  }
  const trend = route.type === 'homepage' ? homepageDuration : route.type === 'blog' ? blogDuration : route.type === 'docs' ? docsDuration : route.type === 'api' ? apiDuration : route.app === 'portfolio' ? projectDuration : null;
  trend?.add(elapsed, tags);
  return response;
}

function readAndScroll(route, persona, device) {
  const started = Date.now();
  visit(route, persona, device);
  const steps = integer(2, 4);
  for (let i = 0; i < steps; i++) {
    const delay = route.type === 'blog' || route.type === 'docs' ? integer(3, 9) : integer(1, 4);
    sleep(delay * thinkTimeScale);
    readingDuration.add(delay * thinkTimeScale * 1000, { route: route.path, page_type: route.type, persona, device });
    // HTTP mode measures human-style think time only; actual DOM scrolling is measured
    // by the separate browser scenario, never reported as a fabricated scroll duration.
    if (Math.random() < 0.18) sleep(integer(1, 3) * thinkTimeScale);
  }
  navigationDuration.add(Date.now() - started, { route: route.path, page_type: route.type, persona, device });
}

function route(app, path) { return appRoutes[app].find((item) => item.path === path); }
function randomPage(routes) { return choose(routes.filter((item) => !['health'].includes(item.type))); }

export default function journey() {
  journeysStarted.add(1);
  const persona = choose(personas);
  const device = choose(devices);
  try {
  const blogs = appRoutes.blogs;
  const docs = appRoutes.docs;
  const home = route('portfolio', '/');
  readAndScroll(home, persona, device);

  if (persona === 'casual') {
    readAndScroll(route('portfolio', '/terms'), persona, device);
    readAndScroll(route('blogs', '/blogs/about/'), persona, device);
  } else if (persona === 'blog') {
    readAndScroll(route('blogs', '/blogs/'), persona, device);
    readAndScroll(choose(blogs.filter((item) => item.type === 'blog')), persona, device);
    if (Math.random() < 0.7) readAndScroll(choose(blogs.filter((item) => item.type === 'blog')), persona, device);
  } else if (persona === 'docs') {
    readAndScroll(route('docs', '/docs/'), persona, device);
    readAndScroll(choose(docs.filter((item) => item.type === 'docs' && item.path !== '/docs/terms/')), persona, device);
    readAndScroll(choose(docs.filter((item) => item.type === 'docs' && item.path !== '/docs/terms/')), persona, device);
  } else if (persona === 'developer') {
    readAndScroll(route('portfolio', '/health'), persona, device);
    readAndScroll(route('blogs', '/blogs/about/'), persona, device);
  } else {
    const app = choose(['portfolio', 'blogs', 'docs']);
    readAndScroll(randomPage(appRoutes[app]), persona, device);
    readAndScroll(randomPage(appRoutes[app]), persona, device);
  }
  if (__ENV.TEST_API === 'true') {
    const api = `${originFor('portfolio')}/api/openstatus`;
    const start = Date.now();
    const response = http.get(api, { ...params({ path: '/api/openstatus', app: 'portfolio', type: 'api' }, persona, device), tags: { route: '/api/openstatus', app: 'portfolio', page_type: 'api', persona, device } });
    apiDuration.add(Date.now() - start, { route: '/api/openstatus', page_type: 'api', status: String(response.status) });
    check(response, { 'API responds': (r) => r.status >= 200 && r.status < 400 });
  }
  journeysCompleted.add(1, { persona, device });
  } catch (error) {
    journeysFailed.add(1, { persona, device });
    console.error(`Journey failed for ${persona}: ${error}`);
  }
}
