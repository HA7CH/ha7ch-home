# ANC — AI Native Company

The bilingual ANC product website, prepared for `anc.ha7ch.com`. Its story starts with owners, managers and employees, then explains Human on the Loop, persistent work, company knowledge, Bean, Dojo, anstack, deployment and a searchable FAQ.

The monochrome design follows `ha7ch.com` and uses the existing HA7CH wordmark. This directory is independent of the parent Next.js app: adding or merging it does not connect the ANC domain or change the main website's routes.

**Deployment owner: start with [DEPLOYMENT.zh-CN.md](DEPLOYMENT.zh-CN.md).** A short handoff is in [HANDOFF.zh-CN.md](HANDOFF.zh-CN.md).

## Local commands

Node.js 22 or newer; no dependency installation or model credentials are needed.

```bash
cd sites/anc
npm run build
npm run check
npm test
npm run dev
```

`dist/` is the editable source. `release/` is a deterministic generated package and should be regenerated after source changes. The local server is for previewing the real homepage response, including its Content Security Policy. It is not a production server.

## Deployment package

- `release/anc-homepage.mjs`: self-contained ES module with HTML, styles, scripts, images and a root-only response handler. Copy this **one file** into the existing Worker and integrate it at the existing homepage route.
- `release/anc-standalone.html`: self-contained HTML for standalone inspection or compatible HTML hosting.
- `release/manifest.json`: source and output checksums.
- `integration/`: integration guidance/template; it does not replace a production Worker.
- `operations/verify-live.mjs`: read-only checks for the deployed homepage. Existing application routes must also pass their own baseline checks.

The homepage uses no backend, analytics, lead form, external fonts or external scripts. Language preference stays in the visitor's browser. Links point to HA7CH's existing public contact page and Dojo.

## Deployment boundary

The existing `anc.ha7ch.com` service also supports page publishing, onboarding and APIs. The prepared handler serves only `GET /` and `HEAD /` on an explicit host allowlist. Every other path or method falls through to the existing application. This release requires no DNS, KV, database, secret, account or authentication changes.

The actual current Worker repository, production configuration and deployment access are not part of this package. Its maintainer must locate them, preserve the existing middleware and routes, run the integration checks, and deploy through the existing pipeline. There is intentionally no guessed `wrangler.json`, Worker name or production deployment workflow here.

## Product scope

Current work execution and prototypes are distinguished from development work. Hardware reliability, contribution attribution and the complete work-to-training cycle are not presented as universally ready. The package contains only the approved public website copy and deployment instructions, with no private customer names, contract values, credentials, runtime files or ChatGPT hosting identity.
