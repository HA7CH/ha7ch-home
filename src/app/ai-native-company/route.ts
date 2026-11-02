import {
  ANC_HOMEPAGE_HTML,
  ANC_HOMEPAGE_CSP,
  ANC_HOMEPAGE_SHA256,
} from '../../../sites/anc/release/anc-homepage.mjs';

// A standalone document preserves the approved design and exact CSP hashes.
// Next.js mounts this only at /ai-native-company; /anc and /anc/01 stay intact.
const headers = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'Content-Security-Policy': ANC_HOMEPAGE_CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-ANC-Site-Version': ANC_HOMEPAGE_SHA256,
};

export function GET() {
  return new Response(ANC_HOMEPAGE_HTML, { headers });
}

export function HEAD() {
  return new Response(null, { headers });
}
