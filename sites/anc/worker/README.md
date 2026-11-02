# Existing ANC Worker integration

`worker.mjs` preserves the deployed `anc-onboard` code exported on 2026-11-02
(version `9bd5cef6-7b77-40e1-81c0-cbe1b7130c4b`). The only behavior change is
calling the generated homepage handler at the existing root route.

Production target: **https://anc.ha7ch.com/**. This is not the parent Next.js app
and does not change `ha7ch.com/anc` or its legacy presentation.

The existing `PAGES` KV binding and `PUBLISH_TOKEN` secret must remain attached.
No storage migration, DNS change or secret rotation is needed. Account-specific
configuration and credentials are not stored here.

For a subsequent release, first check the live version against the last release
record. Export the existing Worker configuration with the authenticated Wrangler
CLI if needed. Use that existing configuration, changing only `main` to this
file, and preserve routes, compatibility date, bindings and runtime settings.
Build/check/test from `sites/anc`; dry-run with pinned Wrangler 4.141.0, then use
the same configuration for the production deployment. Record the immediately
preceding version for rollback. Do not deploy the generic C3 template or a new
Worker to this domain.

The worker tests use an in-memory KV and a synthetic token. They do not write to
production. After deploying, verify the homepage with `operations/verify-live.mjs`,
then compare existing pages, onboarding, sitemap and authenticated publisher
health with their pre-deployment baseline.
