import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from './index.mjs';

const origin = 'https://avdeyev.dev';
const tag = `build-${'a'.repeat(40)}`;
const resume = await readFile(new URL('../cv/resume.json', import.meta.url), 'utf8');
const installer = await readFile(new URL('../public/install.sh', import.meta.url), 'utf8');
const env = {
  ASSETS: {
    async fetch(request) {
      const path = new URL(request.url).pathname;
      const body = path === '/install.sh' ? installer : path === '/index.html' ? '<main id="tui"></main>' : path === '/resume.json' ? resume : 'missing';
      return new Response(request.method === 'HEAD' ? null : body, { status: body === 'missing' ? 404 : 200, headers: { 'Content-Type': path.endsWith('.json') ? 'application/json' : 'text/html' } });
    },
  },
};

test('curl gets the exact production installer; browsers get HTML', async () => {
  const response = await worker.fetch(new Request(origin, { headers: { 'User-Agent': 'curl/8' } }), env);
  assert.equal(await response.text(), installer);
  assert.equal(response.headers.get('Vary'), 'User-Agent, Accept');
  assert.equal(response.headers.get('Cache-Control'), 'no-cache');
  assert.match(installer, /https:\/\/github.com\/eone666\/avdeyev.dev\/releases\/latest\/download/);
  assert.ok(!installer.includes('__TUI_'));
  const html = await worker.fetch(new Request(origin, { headers: { 'User-Agent': 'curl/8', Accept: 'text/html' } }), env);
  assert.match(await html.text(), /<main/);
  assert.equal((await worker.fetch(new Request(origin + '/install-dev.sh'), env)).status, 404);
});

test('versioned WASM and JS are fetched from the corresponding release with correct MIME', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => { calls.push(url); return new Response('asset'); };
  try {
    for (const [asset, mime] of [['avdeyev_tui.js', 'text/javascript; charset=utf-8'], ['avdeyev_tui_bg.wasm', 'application/wasm']]) {
      const response = await worker.fetch(new Request(`${origin}/wasm/${tag}/${asset}`), env);
      assert.equal(await response.text(), 'asset');
      assert.equal(response.headers.get('Content-Type'), mime);
      assert.equal(response.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
      assert.equal(calls.at(-1), `https://github.com/eone666/avdeyev.dev/releases/download/${tag}/${asset}`);
    }
    const head = await worker.fetch(new Request(`${origin}/wasm/${tag}/avdeyev_tui.js`, { method: 'HEAD' }), env);
    assert.equal(await head.text(), '');
    globalThis.fetch = async () => new Response('not yet available', { status: 404 });
    const missing = await worker.fetch(new Request(`${origin}/wasm/${tag}/avdeyev_tui.js`), env);
    assert.equal(missing.status, 502);
    assert.equal(missing.headers.get('Cache-Control'), null);
  } finally { globalThis.fetch = originalFetch; }
});

test('rejects invalid release paths and non-read methods without fetching upstream', async () => {
  for (const path of ['/wasm/latest/avdeyev_tui.js', `/wasm/${tag}/other.js`, '/wasm/arbitrary/file']) {
    assert.equal((await worker.fetch(new Request(origin + path), env)).status, 404);
  }
  assert.equal((await worker.fetch(new Request(origin, { method: 'POST' }), env)).status, 405);
});

test('public resume.json remains directly accessible as JSON', async () => {
  const response = await worker.fetch(new Request(origin + '/resume.json'), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/json');
  assert.deepEqual(await response.json(), JSON.parse(resume));
});
