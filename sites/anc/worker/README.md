# Existing ANC service Worker

The public ANC product website belongs at **https://ha7ch.com/ai-native-company**,
served by the main Next.js/Vercel site. The separate `anc.ha7ch.com` Worker remains
responsible for publishing APIs, onboarding Markdown and stored pages.

## Source status

`worker.mjs` originates from the `anc-onboard` production export dated 2026-11-02.
The checked-in change removes only the marketing-homepage import, initialization
and root interception. The original plain-text root index is restored; existing
service routes, authorization and storage behavior are unchanged.

**This prepares the source reversal. It does not establish that the live Worker
has been updated.** The subdomain may still serve the previous marketing page
until a separate Cloudflare deployment is completed. Merging this repository's
main-site changes does not itself deploy the Worker.

The [2026-11-02 release record](../RELEASE-2026-11-02.md) is historical and remains
unchanged. Its deployment and rollback version IDs must not be assumed current.

## Deploying the root-page removal

1. Inspect the current `anc-onboard` remote deployment and record its active
   version. Export current source/configuration using the existing authenticated
   Wrangler or Cloudflare session, and compare it with this source before making
   the change. Preserve any newer service changes; do not blindly roll back to
   the historical version.
2. Retain the existing `PAGES` KV binding, `PUBLISH_TOKEN` secret, routes,
   compatibility date and runtime settings. No DNS change, storage migration,
   secret rotation or new Worker is needed. Keep configuration and credentials
   outside the repository.
3. Apply the minimal root-page removal to the current service source. Run the
   repository's `npm run test:anc`, then dry-run with the existing configuration
   and pinned Wrangler 4.141.0. Deploy through that same configuration, preserving
   the immediately preceding version for rollback.
4. Check that `/` and `/?lang=zh` return the original plain-text service index,
   with no `X-ANC-Site-Version` marketing header. Check HEAD status and headers,
   `/healthz`, onboarding, existing published pages, robots, sitemap and the
   existing API authorization behavior against the pre-deployment baseline.
   Use authorized read-only health checks for production; the worker tests use
   in-memory KV and a synthetic token and never write to production.

`operations/verify-live.mjs` verifies the bundled marketing document and is
therefore for `https://ha7ch.com/ai-native-company`, not the restored service root.
Do not delete the subdomain or Worker: existing service URLs must keep working.

Record the new deployment/version and verification results separately after the
live change. If service behavior regresses, restore the version recorded directly
before this deployment, without changing KV data or bindings.
