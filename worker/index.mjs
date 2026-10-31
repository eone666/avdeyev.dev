// Infrastructure only; the interface is Rust/WASM.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    if (url.pathname === '/') {
      const terminal = /^(curl|wget)\//i.test(request.headers.get('User-Agent') || '')
        && !(request.headers.get('Accept') || '').toLowerCase().includes('text/html');
      url.pathname = terminal ? '/install.sh' : '/index.html';
      const response = await env.ASSETS.fetch(new Request(url, request));
      const headers = new Headers(response.headers);
      headers.set('Vary', 'User-Agent, Accept');
      headers.set('Cache-Control', 'no-cache');
      if (terminal) headers.set('Content-Type', 'text/plain; charset=utf-8');
      return new Response(response.body, { status: response.status, headers });
    }
    if (url.pathname.startsWith('/wasm/')) {
      // Versioned URLs keep old pages working after a new deployment.
      const match = /^\/wasm\/(build-[a-f0-9]{40})\/(avdeyev_tui\.js|avdeyev_tui_bg\.wasm)$/.exec(url.pathname);
      if (!match) return new Response('Not found', { status: 404 });
      const [, tag, asset] = match;
      const upstream = await fetch(
        `https://github.com/eone666/avdeyev.dev/releases/download/${tag}/${asset}`,
        { redirect: 'follow', cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 31536000, '400-599': 0 } } },
      );
      if (!upstream.ok) return new Response('Release asset unavailable', { status: 502 });
      const headers = new Headers();
      headers.set('Content-Type', asset.endsWith('.wasm') ? 'application/wasm' : 'text/javascript; charset=utf-8');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('X-Content-Type-Options', 'nosniff');
      return new Response(request.method === 'HEAD' ? null : upstream.body, { headers });
    }
    const response = await env.ASSETS.fetch(request);
    if (url.pathname === '/install.sh') {
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      headers.set('Cache-Control', 'no-cache');
      return new Response(response.body, { status: response.status, headers });
    }
    return response;
  },
};
