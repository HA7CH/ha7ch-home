import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, scryptSync, createCipheriv } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { configuration, verifyPassword, issueSession, verifySession, deriveKey, decryptArtifact, destination, allowAttempt } from '../src/lib/fde-camp-access.ts';

test('password, sessions and encrypted artifacts fail closed', async () => {
  const password = 'test-fixture-only';
  const key = randomBytes(32), salt = randomBytes(16);
  process.env.FDE_CAMP_20260913_KEY = key.toString('hex');
  process.env.FDE_CAMP_20260913_PASSWORD = `${salt.toString('hex')}:${scryptSync(password, salt, 32).toString('hex')}`;
  assert.equal(await verifyPassword(password), true);
  assert.equal(await verifyPassword('wrong'), false);
  const now = Date.now(), session = issueSession(now);
  assert.equal(verifySession(session, now), true);
  assert.equal(verifySession(session+'x', now), false);
  assert.equal(verifySession(session, now+8*86400000), false);
  assert.equal(verifySession(undefined), false);
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', deriveKey(key,'content'), iv);
  const encrypted = Buffer.concat([cipher.update(gzipSync('private course')),cipher.final()]);
  const data = Buffer.concat([iv,cipher.getAuthTag(),encrypted]);
  assert.equal(decryptArtifact(data),'private course');
  data[data.length-1]^=1;
  assert.throws(()=>decryptArtifact(data));
  process.env.FDE_CAMP_20260913_PASSWORD = `${salt.toString('hex')}:${scryptSync('rotated',salt,32).toString('hex')}`;
  assert.equal(verifySession(session,now),false);
  delete process.env.FDE_CAMP_20260913_KEY;
  assert.equal(configuration(),null);
  assert.equal(verifySession(session),false);
  assert.equal(await verifyPassword(password),false);
});
test('return paths cannot leave the protected course', () => {
  assert.equal(destination('https://example.com'),'');
  assert.equal(destination('../../private/book'),'');
  assert.equal(destination('book.html'),'book');
  assert.equal(destination('slides'),'slides');
});
test('per-instance password attempts are bounded and expire', () => {
  const id=randomBytes(12).toString('hex'), now=Date.now();
  for(let i=0;i<8;i++)assert.equal(allowAttempt(id,now),true);
  assert.equal(allowAttempt(id,now),false);
  assert.equal(allowAttempt(id,now+300001),true);
});

test('same-origin forms work with privacy policies and reject cross-site requests', async () => {
  const { sameOriginSubmission } = await import('../src/lib/fde-camp-access.ts');
  assert.equal(sameOriginSubmission('https://ha7ch.com', null, 'https://ha7ch.com'), true);
  assert.equal(sameOriginSubmission(null, 'same-origin', 'https://ha7ch.com'), true);
  assert.equal(sameOriginSubmission('null', 'same-origin', 'https://ha7ch.com'), true);
  assert.equal(sameOriginSubmission(null, 'cross-site', 'https://ha7ch.com'), false);
  assert.equal(sameOriginSubmission(null, null, 'https://ha7ch.com'), false);
  assert.equal(sameOriginSubmission('https://other.example', 'same-origin', 'https://ha7ch.com'), false);
});
