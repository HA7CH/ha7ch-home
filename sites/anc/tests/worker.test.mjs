import assert from "node:assert/strict";
import test from "node:test";
import worker from "../worker/worker.mjs";

class MemoryKV {
  constructor(entries = []) {
    this.entries = new Map(entries.map(([key, value, metadata]) => [key, { value, metadata }]));
  }

  async getWithMetadata(key) {
    return this.entries.get(key) ?? { value: null, metadata: null };
  }

  async list({ prefix, cursor }) {
    assert.equal(cursor, undefined);
    return {
      keys: [...this.entries.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([name, entry]) => ({ name, metadata: entry.metadata })),
      list_complete: true,
    };
  }

  async put(key, value, options) {
    this.entries.set(key, { value, metadata: options.metadata, expirationTtl: options.expirationTtl });
  }

  async delete(key) {
    this.entries.delete(key);
  }
}

test("keeps the existing HA7CH onboarding endpoint", async () => {
  const response = await worker.fetch(
    new Request("https://anc.ha7ch.com/ha7ch/onboard.md"),
    { PAGES: new MemoryKV() },
  );
  assert.equal(response.status, 200);
  assert.match(await response.text(), /HA7CH 入职/);
});

test("serves temporary HTML with noindex headers", async () => {
  const kv = new MemoryKV([
    ["page:demo", "<!doctype html><title>Demo</title>", {
      index: false,
      updatedAt: "2026-09-03T00:00:00.000Z",
    }],
  ]);
  const response = await worker.fetch(
    new Request("https://anc.ha7ch.com/p/demo"),
    { PAGES: kv },
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.match(await response.text(), /Demo/);
});

test("only indexed pages appear in the sitemap", async () => {
  const kv = new MemoryKV([
    ["page:public", "<title>Public</title>", {
      index: true,
      updatedAt: "2026-09-03T01:02:03.000Z",
    }],
    ["page:temporary", "<title>Temporary</title>", {
      index: false,
      updatedAt: "2026-09-03T02:03:04.000Z",
    }],
  ]);
  const response = await worker.fetch(
    new Request("https://anc.ha7ch.com/sitemap.xml"),
    { PAGES: kv },
  );
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(body, /https:\/\/anc\.ha7ch\.com\/p\/public/);
  assert.match(body, /2026-09-03T01:02:03\.000Z/);
  assert.doesNotMatch(body, /temporary/);
});

test("returns 404 for an unknown or invalid page slug", async () => {
  const env = { PAGES: new MemoryKV() };
  const missing = await worker.fetch(
    new Request("https://anc.ha7ch.com/p/missing"),
    env,
  );
  const invalid = await worker.fetch(
    new Request("https://anc.ha7ch.com/p/Not-Allowed"),
    env,
  );
  assert.equal(missing.status, 404);
  assert.equal(invalid.status, 404);
});

test("publisher API requires its token and writes expiring pages", async () => {
  const kv = new MemoryKV();
  const env = { PAGES: kv, PUBLISH_TOKEN: "test-secret" };
  const denied = await worker.fetch(new Request("https://anc.ha7ch.com/api/pages/demo", {
    method: "PUT",
    body: JSON.stringify({ html: "<!doctype html><title>Demo</title>", ttlSeconds: 3600 }),
  }), env);
  assert.equal(denied.status, 401);

  const published = await worker.fetch(new Request("https://anc.ha7ch.com/api/pages/demo", {
    method: "PUT",
    headers: { authorization: "Bearer test-secret", "content-type": "application/json" },
    body: JSON.stringify({
      html: "<!doctype html><title>Demo</title>",
      title: "Demo",
      index: false,
      ttlSeconds: 3600,
      updatedAt: "2026-09-03T00:00:00.000Z",
    }),
  }), env);
  assert.equal(published.status, 201);
  assert.equal(kv.entries.get("page:demo").expirationTtl, 3600);

  const served = await worker.fetch(new Request("https://anc.ha7ch.com/p/demo"), env);
  assert.equal(served.status, 200);
  assert.equal(served.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
});


test("restores the original plain-text ANC root and keeps service endpoints", async () => {
  const env = { PAGES: new MemoryKV() };
  const request = (pathname, method = "GET", host = "anc.ha7ch.com") =>
    new Request(`https://${host}${pathname}`, { method });
  const originalIndex = "anc — AI Native Company\n\n入职入口:GET /<company>/onboard.md\n网页展示:GET /p/<slug>\n";
  const get = await worker.fetch(request("/"), env);
  assert.equal(get.status, 200);
  assert.equal(get.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(get.headers.get("x-anc-site-version"), null);
  assert.equal(await get.text(), originalIndex);
  const head = await worker.fetch(request("/", "HEAD"), env);
  assert.equal(head.status, 200);
  assert.deepEqual([...head.headers], [...get.headers]);
  for (const req of [request("/?lang=zh"), request("/", "POST"), request("/", "GET", "example.com")]) {
    const response = await worker.fetch(req, env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-anc-site-version"), null);
    assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
    assert.equal(await response.text(), originalIndex);
  }
  const health = await worker.fetch(request("/healthz"), env);
  assert.deepEqual(await health.json(), { ok: true, service: "anc-onboard" });
});

test("existing published pages retain their own CSP and can still be deleted", async () => {
  const kv = new MemoryKV([["page:existing", "<!doctype html><title>Existing</title>", { index: false }]]);
  const env = { PAGES: kv, PUBLISH_TOKEN: "test-secret" };
  const page = await worker.fetch(new Request("https://anc.ha7ch.com/p/existing"), env);
  assert.equal(page.headers.get("x-anc-site-version"), null);
  assert.match(page.headers.get("content-security-policy"), /unsafe-inline/);
  const removed = await worker.fetch(new Request("https://anc.ha7ch.com/api/pages/existing", {
    method: "DELETE", headers: { authorization: "Bearer test-secret" }
  }), env);
  assert.equal(removed.status, 200);
  assert.equal(kv.entries.has("page:existing"), false);
});

