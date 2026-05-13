// Vercel serverless proxy for Replicate. Deploy this with the app and set
// REPLICATE_API_TOKEN as a *server-side* env var in the Vercel dashboard
// (do NOT expose it via VITE_ / vite.define). Then in the browser set
// REPLICATE_PROXY_URL=/api/replicate so the client never sees the token.
//
// The catch-all [...path] segment captures everything after /api/replicate,
// so requests like /api/replicate/v1/predictions/abc are forwarded to
// https://api.replicate.com/v1/predictions/abc.

export const config = {
  runtime: 'edge',
};

const UPSTREAM = 'https://api.replicate.com';

// Headers we refuse to forward in either direction.
const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade',
  'host', 'content-length',
]);

function filterHeaders(src: Headers, drop: Set<string>): Headers {
  const out = new Headers();
  src.forEach((value, key) => {
    if (!drop.has(key.toLowerCase())) out.append(key, value);
  });
  return out;
}

export default async function handler(req: Request): Promise<Response> {
  const token = (globalThis as any).process?.env?.REPLICATE_API_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'REPLICATE_API_TOKEN not configured on the server.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  // Strip the proxy prefix (/api/replicate) so the remainder is the upstream path.
  const upstreamPath = url.pathname.replace(/^\/api\/replicate/, '') || '/';
  const target = `${UPSTREAM}${upstreamPath}${url.search}`;

  const forwardHeaders = filterHeaders(req.headers, HOP_BY_HOP);
  forwardHeaders.set('Authorization', `Bearer ${token}`);
  // Replicate identifies clients via this header; useful for debugging.
  if (!forwardHeaders.has('User-Agent')) {
    forwardHeaders.set('User-Agent', 'micro-brand-guide-proxy/1.0');
  }

  const init: RequestInit = {
    method: req.method,
    headers: forwardHeaders,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    // @ts-expect-error duplex is required by Node 18+ when streaming a body.
    duplex: 'half',
  };

  const upstream = await fetch(target, init);
  const responseHeaders = filterHeaders(upstream.headers, HOP_BY_HOP);
  // CORS: lock to same-origin in production. The browser sends same-origin
  // requests anyway because we serve under /api/replicate, but be explicit.
  responseHeaders.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
  responseHeaders.set('Vary', 'Origin');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
