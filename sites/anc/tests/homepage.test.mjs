import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createAncHomepageHandler,
  ANC_HOMEPAGE_SHA256,
  ANC_HOMEPAGE_CSP
} from '../release/anc-homepage.mjs';
import { PROJECT_ROOT } from '../scripts/build.mjs';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const cspHash = value => `'sha256-${createHash('sha256').update(value).digest('base64')}'`;
const read = name => readFile(path.join(PROJECT_ROOT, name), 'utf8');
const request = (pathname = '/', method = 'GET', hostname = 'anc.ha7ch.com') =>
  new Request(`https://${hostname}${pathname}`, { method });

test('GET / and query variants return the exact release HTML and release headers', async () => {
  const handle = createAncHomepageHandler();
  const html = await read('release/anc-standalone.html');
  for (const pathname of ['/', '/?utm_source=handoff', '/?lang=zh&x=%2Fapi%2F']) {
    const response = handle(request(pathname));
    assert.ok(response instanceof Response);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), html);
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('content-security-policy'), ANC_HOMEPAGE_CSP);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.equal(response.headers.get('x-anc-site-version'), ANC_HOMEPAGE_SHA256);
    assert.equal(response.headers.get('set-cookie'), null);
  }
  assert.match(ANC_HOMEPAGE_SHA256, /^[0-9a-f]{64}$/);
  assert.equal(sha256(html), ANC_HOMEPAGE_SHA256);
});

test('HEAD / has identical GET headers and no body', async () => {
  const handle = createAncHomepageHandler();
  for (const pathname of ['/', '/?check=1']) {
    const head = handle(request(pathname, 'HEAD'));
    const get = handle(request(pathname));
    assert.equal(head.status, 200);
    assert.equal(head.body, null);
    assert.equal(await head.text(), '');
    assert.deepEqual([...head.headers], [...get.headers]);
  }
});

test('only the exact pathname, permitted method, and explicit hostname are handled', () => {
  const handle = createAncHomepageHandler();
  const paths = ['/p/', '/p/company', '/p/company?view=1', '/api/', '/api/session',
    '/company/onboard.md', '/sitemap.xml', '/index.html', '/favicon.ico', '/login',
    '/auth/callback?code=example', '/robots.txt', '//', '/%2F', '/%2fapi'];
  for (const pathname of paths) {
    for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS']) {
      assert.equal(handle(request(pathname, method)), null, `${method} ${pathname}`);
    }
  }
  for (const method of ['POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(handle(request('/', method)), null, `${method} / must fall through`);
  }
  for (const hostname of ['ha7ch.com', 'www.anc.ha7ch.com', 'anc.ha7ch.com.example.com',
    'preview.workers.dev', 'localhost', 'anc.ha7ch.com.']) {
    assert.equal(handle(request('/', 'GET', hostname)), null, hostname);
  }
});

test('staging requires an exact explicit allowlist and does not enable siblings', () => {
  const staging = 'anc-staging.example.workers.dev';
  const handle = createAncHomepageHandler({ allowedHosts: [staging] });
  assert.ok(handle(request('/', 'GET', staging)) instanceof Response);
  assert.equal(handle(request('/')), null);
  assert.equal(handle(request('/', 'GET', `other.${staging}`)), null);
  assert.equal(handle(request('/p/example', 'GET', staging)), null);
  const both = createAncHomepageHandler({ allowedHosts: ['anc.ha7ch.com', staging] });
  assert.ok(both(request('/')) instanceof Response);
  assert.ok(both(request('/', 'GET', staging)) instanceof Response);
  for (const allowedHosts of [[], ['*'], ['*.ha7ch.com'], ['https://anc.ha7ch.com'],
    ['anc.ha7ch.com/path'], ['anc.ha7ch.com:443'], ['ANC.HA7CH.COM'], [null], 'anc.ha7ch.com']) {
    assert.throws(() => createAncHomepageHandler({ allowedHosts }), TypeError);
  }
});

test('integration leaves existing route status, body, and auth headers intact', async () => {
  const handle = createAncHomepageHandler();
  const existingResponses = [
    ['/p/acme', 'GET', new Response('private product page', { status: 200, headers: { 'Cache-Control': 'private' } })],
    ['/api/session', 'GET', new Response('{"error":"unauthorized"}', { status: 401, headers: { 'Content-Type': 'application/json' } })],
    ['/api/tasks', 'POST', new Response('{"id":"task-123"}', { status: 201 })],
    ['/company/onboard.md', 'GET', new Response('# Existing onboarding\n')],
    ['/sitemap.xml', 'GET', new Response('<urlset/>', { headers: { 'Content-Type': 'application/xml' } })],
    ['/auth/callback', 'GET', new Response(null, { status: 302, headers: { Location: '/p/acme', 'Set-Cookie': 'session=example; Secure; HttpOnly' } })],
    ['/', 'OPTIONS', new Response(null, { status: 204, headers: { Allow: 'GET, HEAD' } })],
    ['/missing', 'GET', new Response('Existing not found', { status: 404 })]
  ];
  let called = 0;
  for (const [pathname, method, expected] of existingResponses) {
    const incoming = request(pathname, method);
    const originalUrl = incoming.url;
    const existing = req => { called++; assert.strictEqual(req, incoming); return expected; };
    const actual = handle(incoming) ?? existing(incoming);
    assert.strictEqual(actual, expected, `${method} ${pathname}: original Response survives`);
    assert.equal(incoming.url, originalUrl);
    assert.equal(actual.headers.get('x-anc-site-version'), null);
  }
  assert.equal(called, existingResponses.length);
  const handled = handle(request('/')) ?? (() => { throw new Error('Unexpected fallback for homepage'); })();
  assert.equal(handled.status, 200);
});

test('standalone HTML contains source scripts in dependency order and all visual assets', async () => {
  const html = await read('release/anc-standalone.html');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]);
  assert.equal(scripts.length, 2);
  assert.equal(styles.length, 1);
  assert.equal(scripts[0], (await read('dist/faq.js')).replace(/<\/script/gi, '<\\/script'));
  assert.equal(scripts[1], (await read('dist/app.js')).replace(/<\/script/gi, '<\\/script'));
  assert.equal(styles[0], await read('dist/style.css'));
  assert.ok(html.indexOf('<script>') > html.indexOf('</footer>'), 'scripts execute after DOM markup');
  assert.doesNotMatch(html, /<(?:script|link)[^>]*(?:src="|rel="stylesheet")/i);
  assert.doesNotMatch(html, /(?:src|href)="assets\//);
  const dataImages = [...html.matchAll(/(?:src|href)="data:image\/svg\+xml;base64,([^"]+)"/g)];
  assert.equal(dataImages.length, 2);
  assert.deepEqual(dataImages.map(match => Buffer.from(match[1], 'base64').toString('utf8')).sort(),
    [await read('dist/assets/anc-symbol.svg'), await read('dist/assets/ha7ch-black.svg')].sort());
});

test('CSP contains exact hashes of all inline bytes and no unsafe-inline permission', async () => {
  const html = await read('release/anc-standalone.html');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]);
  const directives = Object.fromEntries(ANC_HOMEPAGE_CSP.split('; ').map(value => {
    const [name, ...sources] = value.split(' '); return [name, sources];
  }));
  assert.deepEqual(directives['script-src'], scripts.map(cspHash));
  assert.deepEqual(directives['style-src'], styles.map(cspHash));
  assert.deepEqual(directives['img-src'], ['data:']);
  for (const name of ['default-src', 'base-uri', 'object-src', 'form-action', 'frame-ancestors']) {
    assert.deepEqual(directives[name], ["'none'"]);
  }
  assert.doesNotMatch(ANC_HOMEPAGE_CSP, /unsafe-inline|unsafe-eval|https?:|\*/);
  assert.doesNotMatch(html, /\son\w+\s*=|\sstyle\s*=/i);
});

test('manifest verifies current source and output bytes; module is self-contained', async () => {
  const manifest = JSON.parse(await read('release/manifest.json'));
  const html = await read('release/anc-standalone.html');
  assert.equal(manifest.homepage_sha256, ANC_HOMEPAGE_SHA256);
  assert.equal(manifest.homepage_bytes, Buffer.byteLength(html));
  assert.equal(manifest.content_security_policy, ANC_HOMEPAGE_CSP);
  assert.equal(manifest.production_url, 'https://ha7ch.com/ai-native-company');
  assert.deepEqual(manifest.allowed_production_hosts, ['ha7ch.com']);
  assert.deepEqual(manifest.legacy_worker_allowed_hosts, ['anc.ha7ch.com']);
  for (const [filename, hash] of Object.entries({ ...manifest.source_sha256, ...manifest.output_sha256 })) {
    assert.equal(sha256(await readFile(path.join(PROJECT_ROOT, filename))), hash, filename);
  }
  const module = await read('release/anc-homepage.mjs');
  assert.doesNotMatch(module, /^import\s/m);
  assert.doesNotMatch(module, /^export\s+default\s/m);
  assert.doesNotMatch(module, /^\s*(?:const|let|var)\s+.*(?:require\(|process\.|Buffer\.)/m);
});
