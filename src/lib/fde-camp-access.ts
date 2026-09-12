import { createHmac, randomBytes, scrypt, timingSafeEqual, createDecipheriv } from 'node:crypto';
import { promisify } from 'node:util';
import { gunzipSync } from 'node:zlib';

const derive = promisify(scrypt);
export const CAMP_PATH = '/fde-camp';
export const COOKIE_NAME = 'ha7ch_fde_camp_20260913';
export const SESSION_SECONDS = 7 * 24 * 60 * 60;

export function configuration() {
  const key = process.env.FDE_CAMP_20260913_KEY || '';
  const verifier = process.env.FDE_CAMP_20260913_PASSWORD || '';
  if (!/^[a-f0-9]{64}$/i.test(key) || !/^[a-f0-9]{32}:[a-f0-9]{64}$/i.test(verifier)) return null;
  return { key: Buffer.from(key, 'hex'), verifier };
}

export function deriveKey(key: Buffer, purpose: string) {
  return createHmac('sha256', key).update(`ha7ch/fde-camp/20260913/${purpose}`).digest();
}

export async function verifyPassword(password: string) {
  const config = configuration();
  if (!config || password.length > 256) return false;
  const [salt, hash] = config.verifier.split(':');
  const actual = await derive(password, Buffer.from(salt, 'hex'), 32) as Buffer;
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

function sign(payload: string) {
  const config = configuration();
  if (!config) throw new Error('Camp access is not configured');
  return createHmac('sha256', deriveKey(config.key, 'session'))
    .update(config.verifier).update('.').update(payload).digest('base64url');
}

export function issueSession(now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(now / 1000) + SESSION_SECONDS, nonce: randomBytes(12).toString('hex') })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySession(value: string | undefined, now = Date.now()) {
  if (!configuration() || !value || value.length > 512) return false;
  try {
    const [payload, signature, extra] = value.split('.');
    if (!payload || !signature || extra) return false;
    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const current = Math.floor(now / 1000);
    return Number.isInteger(data.exp) && data.exp > current && data.exp <= current + SESSION_SECONDS && typeof data.nonce === 'string';
  } catch { return false; }
}

export function decryptArtifact(data: Buffer) {
  const config = configuration();
  if (!config || data.length < 29) throw new Error('Camp artifact unavailable');
  const decipher = createDecipheriv('aes-256-gcm', deriveKey(config.key, 'content'), data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  const compressed = Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]);
  return gunzipSync(compressed, { maxOutputLength: 10 * 1024 * 1024 }).toString('utf8');
}

export function destination(value: string | null) {
  return value === 'book' || value === 'book.html' ? 'book' : value === 'slides' || value === 'slides.html' ? 'slides' : '';
}

// A bounded per-instance throttle supplements the expensive password verifier.
// It is not a distributed account lockout and does not claim to be one.
const attempts = new Map<string, { count: number; until: number }>();
export function allowAttempt(client: string, now = Date.now()) {
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const record = attempts.get(client);
  if (record) { if (record.count >= 8) return false; record.count++; return true; }
  if (attempts.size >= 10000) return false;
  attempts.set(client, { count: 1, until: now + 5 * 60 * 1000 });
  return true;
}

// Privacy policies may omit Origin. Browser-controlled Fetch Metadata is the fallback.
export function sameOriginSubmission(origin: string | null, site: string | null, expected: string) {
  if (origin && origin !== 'null') return origin === expected;
  return site === 'same-origin';
}
