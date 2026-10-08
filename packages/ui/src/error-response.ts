export function internalErrorResponse(section: "portfolio" | "blogs" | "docs"): Response {
	const homeHref = section === "blogs" ? "/blogs/" : section === "docs" ? "/docs/" : "/";
	return new Response(
		`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#090b0d"><title>Temporarily unavailable — Saksham Dubey</title><style>html{color-scheme:dark;font-family:system-ui,sans-serif;background:#090b0d;color:#e8edf0}body{box-sizing:border-box;margin:0;min-height:100vh;display:grid;place-items:center;padding:1.5rem}main{max-width:42rem}p{color:#91a2aa;line-height:1.7}a{color:#a8ff60}a:focus-visible{outline:2px solid #a8ff60;outline-offset:4px}</style></head><body><main><p>500 · TEMPORARILY UNAVAILABLE</p><h1>Something went wrong.</h1><p>Please try again in a moment, or return to a working section.</p><nav aria-label="Site navigation"><a href="${homeHref}">Back to this section</a> · <a href="/">Portfolio</a> · <a href="/blogs/">Blogs</a> · <a href="/docs/">Docs</a></nav></main></body></html>`,
		{
			status: 500,
			headers: {
				"content-type": "text/html; charset=utf-8",
				"cache-control": "no-store",
				"x-robots-tag": "noindex, nofollow",
			},
		},
	);
}
