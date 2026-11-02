#!/usr/bin/env node
// Read-only verification of one deployed homepage. Run existing application
// regression checks separately; this script never probes private routes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ANC_HOMEPAGE_SHA256, ANC_HOMEPAGE_CSP } from '../release/anc-homepage.mjs';

function parseTarget(value) {
  if (!value) throw new Error('Usage: node operations/verify-live.mjs https://ha7ch.com/ai-native-company');
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Supply a target URL without credentials, query or fragment. A pathname is allowed.');
  }
  const local = ['localhost', '127.0.0.1', 'terminal.local'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new Error('Use HTTPS; HTTP is allowed only for local preview.');
  }
  return url;
}

function verifyHeaders(response, label) {
  assert.equal(response.status, 200, `${label}: expected HTTP 200 (redirects are not followed)`);
  assert.match(response.headers.get('content-type') || '', /^text\/html;\s*charset=utf-8$/i, `${label}: HTML content type`);
  assert.equal(response.headers.get('x-anc-site-version'), ANC_HOMEPAGE_SHA256, `${label}: release version header`);
  assert.match(response.headers.get('cache-control') || '', /(?:^|,)\s*no-store\s*(?:,|$)/i, `${label}: no-store cache policy`);
  assert.match(response.headers.get('cache-control') || '', /(?:^|,)\s*no-transform\s*(?:,|$)/i, `${label}: preserve exact HTML through proxies`);
  assert.equal(response.headers.get('content-security-policy'), ANC_HOMEPAGE_CSP, `${label}: expected hash-based CSP (review any upstream changes)`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', `${label}: nosniff header`);
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin', `${label}: referrer policy`);
}

try {
  const target = parseTarget(process.argv[2]);
  if (process.argv.length !== 3) throw new Error('Supply exactly one target URL argument.');
  const translated = new URL(target);
  translated.searchParams.set('lang', 'zh');
  for (const [method, url] of [['GET', target], ['GET', translated], ['HEAD', target]]) {
    const label = `${method} ${url.pathname}${url.search}`;
    const response = await fetch(url, {
      method, redirect: 'manual', signal: AbortSignal.timeout(15000),
      headers: { Accept: 'text/html', 'Cache-Control': 'no-cache' }
    });
    verifyHeaders(response, label);
    const body = Buffer.from(await response.arrayBuffer());
    if (method === 'HEAD') assert.equal(body.length, 0, `${label}: no response body`);
    else assert.equal(createHash('sha256').update(body).digest('hex'), ANC_HOMEPAGE_SHA256, `${label}: exact release bytes`);
    console.log(`PASS ${label}: status, headers and ${method === 'HEAD' ? 'empty body' : 'content hash'}`);
  }
  console.log(`Homepage verified at ${target.href}; release ${ANC_HOMEPAGE_SHA256}`);
  console.log('Next: browser interactions and existing application-route/authentication checks from DEPLOYMENT.zh-CN.md.');
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
