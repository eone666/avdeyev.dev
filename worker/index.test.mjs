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

test('static JS and WASM are served directly by Cloudflare assets', async () => {
  const paths = [];
  const staticEnv = { ASSETS: { async fetch(request) {
    paths.push(new URL(request.url).pathname);
    return new Response('asset', { headers: { 'Content-Type': paths.at(-1).endsWith('.wasm') ? 'application/wasm' : 'text/javascript' } });
  } } };
  for (const asset of ['avdeyev_tui.js', 'avdeyev_tui_bg.wasm']) {
    const path = `/wasm/${tag}/${asset}`;
    const response = await worker.fetch(new Request(origin + path), staticEnv);
    assert.equal(await response.text(), 'asset');
    assert.equal(paths.at(-1), path);
  }
  assert.equal((await worker.fetch(new Request(origin, { method: 'POST' }), env)).status, 405);
});

test('public resume.json remains directly accessible as JSON', async () => {
  const response = await worker.fetch(new Request(origin + '/resume.json'), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/json');
  assert.deepEqual(await response.json(), JSON.parse(resume));
});
