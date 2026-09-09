import test from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.BASE_URL ?? 'http://localhost:3001';
for (const path of ['og-11','og-235','og-combined','en/og-combined','zh/og-combined','cards/en/0']) {
  test(`image route preserves PNG output: ${path}`, async () => {
    const response = await fetch(`${base}/writing/zero-token-design/${path}`, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status,200);
    assert.match(response.headers.get('content-type') ?? '', /^image\/png/);
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.deepEqual([...bytes.slice(0,8)], [137,80,78,71,13,10,26,10]);
    assert.ok(bytes.length > 1000);
  });
}
