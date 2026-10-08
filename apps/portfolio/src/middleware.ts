import { defineMiddleware } from 'astro:middleware';
import { internalErrorResponse } from '@saksham/ui/error-response';

const PRIMARY_HOST = 'sakshampy.in';
const ALIAS_HOSTS = new Set([
  'www.sakshampy.in',
  'demo.sakshampy.in',
  'saksham.sakshampy.in',
  'portfolio.sakshampy.in',
]);

export const onRequest = defineMiddleware(async ({ request }, next) => {
  try {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    if (ALIAS_HOSTS.has(hostname)) {
      url.protocol = 'https:';
      url.hostname = PRIMARY_HOST;
      return Response.redirect(url, 301);
    }

    return await next();
  } catch (error) {
    console.error('Portfolio request failed', error);
    return internalErrorResponse('portfolio');
  }
});
