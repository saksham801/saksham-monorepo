import { defineMiddleware } from 'astro:middleware';
import { internalErrorResponse } from '@saksham/ui/error-response';

const PRIMARY_HOST = 'sakshampy.in';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export const onRequest = defineMiddleware(async ({ request }, next) => {
	try {
		const url = new URL(request.url);
		const hostname = url.hostname.toLowerCase();

		if (hostname !== PRIMARY_HOST && !LOCAL_HOSTS.has(hostname)) {
			url.protocol = 'https:';
			url.hostname = PRIMARY_HOST;
			if (url.pathname === '/' || url.pathname === '/blogs') {
				url.pathname = '/blogs/';
			} else if (url.pathname === '/blog') {
				url.pathname = '/blogs/';
			} else if (url.pathname.startsWith('/blog/')) {
				url.pathname = `/blogs${url.pathname.slice('/blog'.length)}`;
			} else if (!url.pathname.startsWith('/blogs/')) {
				url.pathname = `/blogs/${url.pathname.replace(/^\/+/, '')}`;
			}
			return Response.redirect(url, 301);
		}

		return await next();
	} catch (error) {
		console.error('Blogs request failed', error);
		return internalErrorResponse('blogs');
	}
});
