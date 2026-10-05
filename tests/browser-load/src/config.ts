import { randomUUID } from 'node:crypto';

export type AppName = 'portfolio' | 'docs' | 'blogs';
export type RouteType = 'homepage' | 'listing' | 'article' | 'documentation' | 'project' | 'about' | 'contact' | 'search' | 'dynamic' | 'other';
export interface RouteDefinition { app: AppName; url: string; path: string; type: RouteType; }

const target = process.env.TARGET ?? 'production';
const defaults = target === 'local'
  ? { portfolio: 'http://localhost:4321', docs: 'http://localhost:4322', blogs: 'http://localhost:4323' }
  : { portfolio: 'https://sakshampy.in', docs: 'https://docs.sakshampy.in', blogs: 'https://blogs.sakshampy.in' };
export const bases: Record<AppName, string> = {
  portfolio: process.env.PORTFOLIO_URL ?? defaults.portfolio,
  docs: process.env.DOCS_URL ?? defaults.docs,
  blogs: process.env.BLOGS_URL ?? defaults.blogs,
};
export const runId = `${new Date().toISOString().replaceAll(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
export const seed = Number(process.env.SEED ?? Date.now()) >>> 0;
export const limits = {
  users: Number(process.env.USERS ?? (process.env.LOAD_PROFILE === 'smoke' ? 3 : process.env.LOAD_PROFILE === 'heavy' ? 25 : 10)),
  duration: Number(process.env.DURATION ?? (process.env.LOAD_PROFILE === 'smoke' ? 60 : 300)),
  maxUsers: Number(process.env.MAX_USERS ?? 50),
  maxDuration: Number(process.env.MAX_DURATION ?? 600),
  maxRequests: Number(process.env.MAX_REQUESTS ?? 100_000),
  initialUsers: Number(process.env.INITIAL_USERS ?? 1),
  rampUpSeconds: Number(process.env.RAMP_UP_SECONDS ?? 30),
  holdSeconds: Number(process.env.HOLD_SECONDS ?? process.env.DURATION ?? 300),
  rampDownSeconds: Number(process.env.RAMP_DOWN_SECONDS ?? 10),
};
export const behavior = {
  minThinkTimeMs: Number(process.env.MIN_THINK_TIME_MS ?? 800), maxThinkTimeMs: Number(process.env.MAX_THINK_TIME_MS ?? 5000),
  scrollProbability: 0.8, clickProbability: 0.7, backProbability: 0.15,
  minPagesPerSession: 3, maxPagesPerSession: 12,
};
export const thresholds = {
  p95Ms: Number(process.env.PERF_P95_MS ?? 3000), errorRatePercent: Number(process.env.ERROR_RATE_PERCENT ?? 1),
  failedRequestRatePercent: Number(process.env.FAILED_REQUEST_RATE_PERCENT ?? 1),
};
export const productionAllowed = process.env.ALLOW_PRODUCTION_LOAD_TEST === 'true';
export const isProduction = Object.values(bases).some((url) => new URL(url).hostname.endsWith('sakshampy.in'));
export const allowedHosts = new Set(Object.values(bases).map((value) => new URL(value).host));
export function appForUrl(url: string): AppName | undefined {
  const host = new URL(url).host;
  return (Object.entries(bases) as [AppName, string][]).find(([, base]) => new URL(base).host === host)?.[0];
}
