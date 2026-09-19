import { defineMiddleware } from 'astro:middleware';

const PRIMARY_HOST = 'blogs.sakshampy.in';
const ALIAS_HOSTS = new Set(['www.blogs.sakshampy.in']);

export const onRequest = defineMiddleware(({ request }, next) => {
	const url = new URL(request.url);
	const hostname = url.hostname.toLowerCase();

	if (ALIAS_HOSTS.has(hostname)) {
		url.protocol = 'https:';
		url.hostname = PRIMARY_HOST;
		return Response.redirect(url, 301);
	}

	return next();
});
