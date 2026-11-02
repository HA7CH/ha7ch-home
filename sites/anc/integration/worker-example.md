# Add one route to the existing Worker

Copy `release/anc-homepage.mjs` next to the real Worker's entrypoint (or adjust the relative import). This generated module contains its HTML, CSS, JavaScript, SVGs and CSP. It needs no imports, assets bindings or runtime packages.

Add this import and initialization at module scope:

```js
import { createAncHomepageHandler } from './anc-homepage.mjs';
const ancHomepage = createAncHomepageHandler();
```

At the existing `/` route's response decision, **inside the existing middleware/security boundary**, insert:

```js
const homepage = ancHomepage(request);
if (homepage) return homepage;
// Continue the existing routes/handler unchanged.
```

This is a snippet, not a replacement Worker export. Preserve existing authentication and response middleware, `fetch`, scheduled handlers, Durable Object exports, routes, custom domains and bindings. The module returns `null` for non-root paths, non-GET/HEAD methods and unapproved hosts.

If the Worker currently routes `/` before middleware, review its actual flow rather than blindly inserting a new early return. For a router framework, register only the exact root path using its existing middleware conventions.

Staging must use an explicit approved hostname, for example:

```js
const ancHomepage = createAncHomepageHandler({
  allowedHosts: ['anc.ha7ch.com', 'YOUR-EXACT-STAGING-HOST.workers.dev']
});
```

Replace the uppercase placeholder with the actual **lowercase** hostname. Do not use a wildcard. Keep staging configuration out of the production allowlist unless it is intended to be served by that same Worker.

The helper sets a hash-based CSP for its exact inline assets. Existing upstream/response middleware can add another CSP; browser policies are intersected. Reconcile only the new homepage response, do not disable security headers globally. Any HTML transformation must be tested because it can invalidate these hashes.

The initial homepage uses `Cache-Control: no-store`, no cookies, no database writes and no added network calls. `X-ANC-Site-Version` is the full HTML SHA256 from `release/manifest.json`. `HEAD /` returns the same headers with no body.
