import test from 'node:test';
import assert from 'node:assert/strict';
import { negotiate, markdownResponse, recoveryMarkdown } from '../src/lib/content-negotiation.ts';
for (const [accept, expected] of [
  [null, 'html'], ['', 'html'], ['*/*', 'html'], ['text/*', 'html'],
  ['text/markdown', 'markdown'], ['TEXT/MARKDOWN; charset=utf-8', 'markdown'],
  ['text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'html'],
  ['text/html;q=0.5, text/markdown;q=0.9', 'markdown'],
  ['text/markdown;q=0.1, text/html;q=0.9', 'html'],
  ['text/markdown;q=0, */*;q=0.8', 'html'],
  ['text/html;q=0, */*;q=0.8', 'markdown'],
  ['text/markdown;q=0', null], ['application/json', null],
  ['text/html;q=0,text/markdown;q=0', null],
  ['text/markdown; charset=iso-8859-1, text/html;q=0.5', 'html'],
]) test(`Accept ${accept} => ${expected}`, () => assert.equal(negotiate(accept), expected));
test('404 is Markdown with recovery links and no cache', async () => {
  const response = markdownResponse(recoveryMarkdown, 404);
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type') , /text\/markdown/);
  assert.match(response.headers.get('vary') , /Accept/);
  assert.match(response.headers.get('cache-control') , /no-store/);
  for (const path of ['sitemap.xml','llms.txt','docs','contact']) assert.ok((await response.clone().text()).includes(`https://ha7ch.com/${path}`));
});
test('Vercel final-response transform covers negotiated pages and preserves framework routing', async () => {
  const { readFile } = await import('node:fs/promises');
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const route = config.routes[0];
  assert.equal(route.continue,true);
  const pattern = new RegExp(route.src);
  for (const path of ['/', '/about', '/docs', '/contact', '/privacy', '/hdc/diagnosis', '/academy/executive-ai-camp', '/writing/example', '/writing/example/zh']) assert.ok(pattern.test(path),path);
  for (const path of ['/_next/static/app.js','/ha7ch.svg','/raily','/writing/example/og']) assert.ok(!pattern.test(path),path);
  assert.deepEqual(route.transforms, [{type:'response.headers',op:'append',target:{key:'Vary'},args:'Accept, Accept-Encoding'}]);
});
