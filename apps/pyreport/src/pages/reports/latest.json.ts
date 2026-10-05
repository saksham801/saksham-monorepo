import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ url }) => {
  const destination = `/reports/latest/${url.search}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#090b0d"><title>Opening latest Pyreport</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#090b0d;color:#e8edf0;font:14px Manrope,Arial,sans-serif}.card{max-width:440px;margin:24px;padding:28px;border:1px solid #293235;background:#111517}.eyebrow{color:#a8ff60;font:10px monospace;letter-spacing:.12em}h1{font-size:23px}p{color:#899499;line-height:1.7}a{color:#a8ff60}</style></head><body><main class="card"><span class="eyebrow">PYREPORT / LATEST RUN</span><h1>Opening your report…</h1><p>The machine-readable data is available separately. This page is taking you to the formatted report.</p><a href="${destination}">Open the human-readable report</a></main><script>location.replace(${JSON.stringify(destination)})</script></body></html>`;
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
};
