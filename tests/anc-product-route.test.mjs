import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { GET, HEAD } from '../src/app/ai-native-company/route.ts';

test('product route returns the self-contained release with matching integrity and security headers', async () => {
  const response = GET();
  const html = await response.text();
  const release = await readFile(new URL('../sites/anc/release/anc-standalone.html', import.meta.url), 'utf8');
  assert.equal(response.status, 200);
  assert.equal(html, release);
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(response.headers.get('x-anc-site-version'), createHash('sha256').update(html).digest('hex'));
  assert.match(html, /<link rel="canonical" href="https:\/\/ha7ch\.com\/ai-native-company">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/ha7ch\.com\/ai-native-company">/);
  assert.doesNotMatch(html, /(?:src|href)="(?:style\.css|app\.js|faq\.js|assets\/)/);
  const csp = response.headers.get('content-security-policy');
  for (const match of html.matchAll(/<(script|style)>([\s\S]*?)<\/\1>/g)) {
    const hash = createHash('sha256').update(match[2]).digest('base64');
    assert.ok(csp.includes(`'sha256-${hash}'`), `${match[1]} bytes must be authorized by CSP`);
  }
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
});

test('product HEAD returns the GET headers with no response body', async () => {
  const head = HEAD();
  assert.equal(head.status, 200);
  assert.equal(head.body, null);
  assert.equal(await head.text(), '');
  assert.deepEqual([...head.headers], [...GET().headers]);
});
