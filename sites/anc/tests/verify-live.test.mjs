import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { PROJECT_ROOT } from '../scripts/build.mjs';
import { createAncHomepageHandler, ANC_HOMEPAGE_SHA256 } from '../release/anc-homepage.mjs';

// Run the real verification CLI against a disposable same-process HTTP fixture.
// No preview daemon or external deployment is contacted by these tests.
async function fixture(t, mutate = value => value, pathname = '/') {
  const requests = [];
  const homepage = createAncHomepageHandler({ allowedHosts: ['127.0.0.1'] });
  const server = http.createServer(async (req, res) => {
    requests.push({ method: req.method, path: req.url });
    try {
      const target = new URL(req.url, `http://${req.headers.host}`);
      assert.equal(target.pathname, pathname, 'verification must preserve the requested target path');
      // The legacy helper supplies the exact release response; the fixture mounts
      // that response at the requested path, as the main site's Next.js route does.
      target.pathname = '/';
      const original = homepage(new Request(target, { method: req.method }));
      assert.ok(original, 'verification must only request the homepage');
      const result = mutate({
        status: original.status,
        headers: Object.fromEntries(original.headers),
        body: Buffer.from(await original.arrayBuffer())
      }, req);
      res.writeHead(result.status, result.headers);
      res.end(req.method === 'HEAD' ? undefined : result.body);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(error.message);
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  });
  return { origin: `http://127.0.0.1:${server.address().port}`, requests };
}

function runVerification(target) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['operations/verify-live.mjs', target], {
      cwd: PROJECT_ROOT, stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Local verification CLI exceeded 10 seconds.'));
    }, 10000);
    child.stdout.setEncoding('utf8').on('data', value => { stdout += value; });
    child.stderr.setEncoding('utf8').on('data', value => { stderr += value; });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
  });
}

test('verify-live CLI accepts the exact release response for GET, query GET and HEAD', async t => {
  const { origin, requests } = await fixture(t);
  const result = await runVerification(origin);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal((result.stdout.match(/^PASS /gm) || []).length, 3);
  assert.match(result.stdout, new RegExp(`release ${ANC_HOMEPAGE_SHA256}`));
  assert.deepEqual(requests, [
    { method: 'GET', path: '/' },
    { method: 'GET', path: '/?lang=zh' },
    { method: 'HEAD', path: '/' }
  ]);
});

test('verify-live CLI preserves a full target path for GET, query GET and HEAD', async t => {
  const pathname = '/ai-native-company';
  const { origin, requests } = await fixture(t, undefined, pathname);
  const target = `${origin}${pathname}`;
  const result = await runVerification(target);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal((result.stdout.match(/^PASS /gm) || []).length, 3);
  assert.ok(result.stdout.includes(`Homepage verified at ${target};`));
  assert.deepEqual(requests, [
    { method: 'GET', path: pathname },
    { method: 'GET', path: `${pathname}?lang=zh` },
    { method: 'HEAD', path: pathname }
  ]);
});

test('verify-live CLI rejects ambiguous or credential-bearing targets before any request', async t => {
  const { origin, requests } = await fixture(t);
  const credentials = new URL('/ai-native-company', origin);
  credentials.username = 'example';
  for (const target of [credentials.href, `${origin}/ai-native-company?lang=en`, `${origin}/ai-native-company#faq`]) {
    const result = await runVerification(target);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /without credentials, query or fragment/);
  }
  const insecure = await runVerification('http://example.com/ai-native-company');
  assert.equal(insecure.code, 1);
  assert.match(insecure.stderr, /Use HTTPS/);
  assert.deepEqual(requests, []);
});

test('verify-live CLI rejects changed HTML despite correct status and version header', async t => {
  const { origin, requests } = await fixture(t, response => ({
    ...response, body: Buffer.concat([response.body, Buffer.from('\n<!-- upstream modification -->')])
  }));
  const result = await runVerification(origin);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /FAIL: GET \/: exact release bytes/);
  assert.doesNotMatch(result.stdout, /Homepage verified/);
  assert.deepEqual(requests, [{ method: 'GET', path: '/' }]);
});

test('verify-live CLI rejects redirects without following their target', async t => {
  const { origin, requests } = await fixture(t, response => ({
    ...response, status: 302, headers: { ...response.headers, location: '/redirect-target' }
  }));
  const result = await runVerification(origin);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /FAIL: GET \/: expected HTTP 200 \(redirects are not followed\)/);
  assert.doesNotMatch(result.stdout, /Homepage verified/);
  assert.deepEqual(requests, [{ method: 'GET', path: '/' }]);
});

test('verify-live CLI rejects a HEAD version mismatch after successful GET checks', async t => {
  const { origin, requests } = await fixture(t, (response, req) => {
    if (req.method === 'HEAD') response.headers['x-anc-site-version'] = 'different-deployment';
    return response;
  });
  const result = await runVerification(origin);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /FAIL: HEAD \/: release version header/);
  assert.equal((result.stdout.match(/^PASS /gm) || []).length, 2);
  assert.doesNotMatch(result.stdout, /Homepage verified/);
  assert.deepEqual(requests, [
    { method: 'GET', path: '/' },
    { method: 'GET', path: '/?lang=zh' },
    { method: 'HEAD', path: '/' }
  ]);
});
