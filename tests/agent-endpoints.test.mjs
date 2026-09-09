import test from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.BASE_URL ?? 'http://localhost:3001';
const get = (path, accept = 'text/html', init = {}) => fetch(new URL(path, base), { ...init, headers: { Accept: accept, ...init.headers } });
const batches = async (items, check) => {
  for (let i = 0; i < items.length; i += 6) await Promise.all(items.slice(i, i + 6).map(check));
};
const markdown = async (path) => {
  const r = await get(path, 'text/markdown');
  assert.equal(r.status, 200, path);
  assert.match(r.headers.get('content-type') ?? '', /^text\/markdown/);
  assert.match(r.headers.get('vary') ?? '', /\bAccept\b/i);
  const body = await r.text(); assert.match(body, /^# /); return body;
};
test('negotiation and cache isolation on identical URLs', async () => {
  for (const accept of ['text/markdown','text/html','text/markdown','text/html','*/*']) {
    const r = await get('/', accept);
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), accept === 'text/markdown' ? /text\/markdown/ : /text\/html/);
    assert.match(r.headers.get('vary') ?? '', /\bAccept\b/i);
    assert.match(r.headers.get('link') ?? '', /llms\.txt/);
  }
  assert.equal((await get('/', 'application/json')).status, 406);
  assert.match((await get('/', 'text/html;q=0.1,text/markdown;q=0.8')).headers.get('content-type'), /markdown/);
  assert.match((await get('/', 'text/markdown;q=0,*/*;q=0.8')).headers.get('content-type'), /html/);
  const head = await get('/', 'text/markdown', { method: 'HEAD' });
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
});
test('missing resources return real 404 with recovery routes', async () => {
  const browser404 = await get('/agent-audit-nonexistent-98571');
  assert.equal(browser404.status,404); assert.match(browser404.headers.get('content-type'), /html/);
  const default404 = await get('/agent-audit-nonexistent-98571', '*/*');
  assert.equal(default404.status,404); assert.match(default404.headers.get('content-type'), /markdown/);
  for (const path of ['/agent-audit-nonexistent-98571','/writing/agent-audit-nonexistent.md','/writing/agent-audit-nonexistent/md','/docs/missing.md']) {
    const r = await get(path, 'text/markdown'); assert.equal(r.status,404,path);
    const body = await r.text(); assert.match(body,/llms\.txt/); assert.match(body,/sitemap\.xml/);
    assert.equal((await get(path,'text/markdown',{method:'HEAD'})).status,404);
  }
});
test('trust and developer pages, canonical metadata, Markdown parity', async () => {
  for (const path of ['/about','/contact','/privacy','/docs']) {
    const r = await get(path); assert.equal(r.status,200);
    const html = await r.text();
    assert.ok(html.includes(`https://ha7ch.com${path}`));
    assert.match(html, /HA7CH/);
    const md = await markdown(path); assert.ok(md.length > 500); assert.match(md, new RegExp(path === '/privacy' ? '^# HA7CH Website Privacy' : path === '/docs' ? '^# HA7CH Developer' : '^# ' + path.slice(1)[0].toUpperCase() + path.slice(2) + ' HA7CH'));
    assert.equal(await markdown(`${path}.md`), md);
    assert.ok(html.includes(md.split('\n')[0].slice(2).replaceAll('&','&amp;')));
  }
  assert.match(await markdown('/agent-instructions.md'), /When to use HA7CH/);
  assert.match(await markdown('/hdc/diagnosis.md'), /80,000 RMB/);
  assert.match(await markdown('/hdc/diagnosis.md'), /工作说明书及合同/);
  await markdown('/academy/executive-ai-camp.md');
  assert.equal(await markdown('/index.md'), await markdown('/'));
});
test('llms file format and every local index target resolves', async () => {
  const md = await markdown('/llms.txt');
  assert.match(md, /^# HA7CH\n\n> /);
  assert.match(md, /## When to use HA7CH/);
  for (const section of md.split(/^## /m).slice(1)) {
    for (const line of section.split('\n').slice(1).filter(Boolean)) assert.ok(line.startsWith('- ['), line);
  }
  const paths = [...new Set([...md.matchAll(/\]\(https:\/\/ha7ch\.com([^)]*)\)/g)].map(m => m[1]))];
  await batches(paths, async (path) => {
    const r = await get(path, '*/*'); assert.equal(r.status,200,path);
    if (path.endsWith('.md') || path.endsWith('.txt')) assert.match(r.headers.get('content-type'),/markdown/,path);
    const body = await r.text();
    if (path.startsWith("/writing/") && path.endsWith(".md")) assert.ok(!body.startsWith("# HA7CH\n"), path);
  });
});
test('sitemap public routes and robots', async () => {
  const r = await get('/sitemap.xml', '*/*'); assert.equal(r.status,200);
  const xml = await r.text();
  for (const path of ['/about','/contact','/privacy','/docs']) assert.ok(xml.includes(`https://ha7ch.com${path}`));
  await batches([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), async (url) => {
    const path = new URL(url).pathname;
    const response = await get(path, '*/*'); assert.equal(response.status,200,path); await response.arrayBuffer();
  });
  assert.match(await (await get('/robots.txt','*/*')).text(), /Sitemap: https:\/\/ha7ch.com\/sitemap.xml/);
});
test('organization contact and preserved redirects/assets/Flight', async () => {
  const html = await (await get('/')).text();
  const navigation = html.match(/<nav class="site-information"[^>]*>(.*?)<\/nav>/s)?.[1];
  assert.ok(navigation, 'Information links use a separate footer navigation');
  for (const path of ['/about','/docs','/contact','/privacy']) assert.ok(navigation.includes(`href="${path}"`));
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const org = blocks.flatMap(b => b['@graph'] ?? [b]).find(b => b['@type'] === 'Organization');
  assert.equal(org.contactPoint.email, 'lawtedwu@gmail.com');
  assert.equal(org.contactPoint['@type'], 'ContactPoint');
  for (const path of ['/event','/event/example','/raily']) {
    const r = await get(path,'text/markdown',{redirect:'manual'}); assert.ok([301,302,307,308].includes(r.status),path);
  }
  const asset = await get('/ha7ch.svg','*/*'); assert.equal(asset.status,200); assert.match(asset.headers.get('content-type'), /image\/svg/);
  const flight = await get('/','*/*',{headers:{RSC:'1'}}); assert.match(flight.headers.get('content-type'),/text\/x-component/);
});
test('canonical production domain has no redirect chain', { skip: new URL(base).hostname !== 'ha7ch.com' }, async () => {
  assert.equal((await get('/', '*/*', {redirect:'manual'})).status,200);
  assert.equal((await get('/agent-audit-nonexistent-98571', '*/*', {redirect:'manual'})).status,404);
  const www = await fetch('https://www.ha7ch.com/docs', {redirect:'manual'});
  assert.equal(www.status,308); assert.equal(www.headers.get('location'),'https://ha7ch.com/docs');
});
