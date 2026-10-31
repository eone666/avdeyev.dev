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
