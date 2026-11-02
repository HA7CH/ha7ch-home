/**
 * Source template embedded in release/anc-homepage.mjs by the build.
 * The release supplies ANC_HOMEPAGE_HTML, ANC_HOMEPAGE_SHA256 and ANC_HOMEPAGE_CSP.
 * Preserve the existing Worker's middleware and route fallthrough when using it.
 */
export function createAncHomepageHandler({ allowedHosts = ['anc.ha7ch.com'] } = {}) {
  if (!Array.isArray(allowedHosts) || allowedHosts.length === 0 || allowedHosts.some(host =>
    typeof host !== 'string' || host !== host.toLowerCase() || !/^[a-z0-9.-]+$/.test(host)
  )) throw new TypeError('allowedHosts must be a nonempty array of exact lowercase hostnames, without a scheme, wildcard, port, or path.');
  const hosts = new Set(allowedHosts);
  return function handleAncHomepage(request) {
    const url = new URL(request.url);
    if (!hosts.has(url.hostname) || url.pathname !== '/' || !['GET', 'HEAD'].includes(request.method)) return null;
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': ANC_HOMEPAGE_CSP,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-ANC-Site-Version': ANC_HOMEPAGE_SHA256
    };
    return new Response(request.method === 'HEAD' ? null : ANC_HOMEPAGE_HTML, { status: 200, headers });
  };
}
