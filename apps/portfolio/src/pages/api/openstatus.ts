import type { APIRoute } from 'astro';

export const prerender = false;

const OPENSTATUS_ENDPOINT = 'https://api.openstatus.dev/rpc/openstatus.status_page.v1.StatusPageService/GetOverallStatus';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const runtime = (locals as { runtime?: { env?: Record<string, string | undefined> } }).runtime;
    const apiKey = runtime?.env?.OPENSTATUS_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenStatus is not configured. Add OPENSTATUS_API_KEY as a Cloudflare secret.' }), {
        status: 503,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    }
    const upstream = await fetch(OPENSTATUS_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-openstatus-key': apiKey },
      body: JSON.stringify({ slug: 'saksham' }),
    });
    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('OpenStatus proxy failed', error);
    return new Response(JSON.stringify({ error: 'OpenStatus request failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }
};
