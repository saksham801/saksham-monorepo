import { Counter, Trend } from 'k6/metrics';
import { routeGroups } from '../config/routes.js';

export const successfulPages = new Counter('successful_pages');
export const failedPages = new Counter('failed_pages');
export const successfulBlogReads = new Counter('successful_blog_reads');
export const successfulDocsReads = new Counter('successful_docs_reads');
export const httpErrors = new Counter('http_errors');
export const status2xx = new Counter('http_2xx');
export const status3xx = new Counter('http_3xx');
export const status4xx = new Counter('http_4xx');
export const status5xx = new Counter('http_5xx');
export const timeoutErrors = new Counter('timeout_errors');
export const responseBytes = new Trend('response_bytes', true);
export const cacheResponses = new Counter('cache_responses');
export const routeVisits = new Counter('route_visits');
export const routeErrors = new Counter('route_errors');
export const routeDuration = new Trend('route_duration', true);
const metricKey = (app, path) => `${app}_${path.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'root'}`;
export const routeMetrics = Object.fromEntries(Object.entries(routeGroups).flatMap(([app, routes]) => routes.map(({ path }) => {
  const key = metricKey(app, path);
  return [`${app}:${path}`, {
    visits: new Counter(`route_visits_${key}`),
    errors: new Counter(`route_errors_${key}`),
    duration: new Trend(`route_duration_${key}`, true),
  }];
})));
export const journeysStarted = new Counter('journeys_started');
export const journeysCompleted = new Counter('journeys_completed');
export const journeysFailed = new Counter('journeys_failed');
export const browserErrors = new Counter('browser_errors');
export const homepageDuration = new Trend('homepage_duration', true);
export const blogDuration = new Trend('blog_duration', true);
export const docsDuration = new Trend('docs_duration', true);
export const projectDuration = new Trend('project_duration', true);
export const apiDuration = new Trend('api_duration', true);
export const readingDuration = new Trend('reading_duration', true);
export const scrollDuration = new Trend('scroll_duration', true);
export const navigationDuration = new Trend('navigation_duration', true);
