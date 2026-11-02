# ANC — AI Native Company

The bilingual ANC product website is served at **https://ha7ch.com/ai-native-company** through the existing `ha7ch-home` Next.js app and Vercel deployment. It introduces ANC through owners, managers and employees, then connects Human on the Loop, company knowledge, persistent work, Bean, Dojo and a searchable FAQ.

The monochrome design follows HA7CH. The existing `/anc` redirect and `/anc/01` page remain unchanged.

## Source and generated release

- `dist/`: editable HTML, CSS, JavaScript and SVG assets.
- `release/anc-homepage.mjs`: generated, self-contained HTML plus its CSP and content hash. The main app imports these exports in `src/app/ai-native-company/route.ts`.
- `release/anc-standalone.html`: the same complete document for inspection or compatible HTML hosting.
- `release/manifest.json`: production URL, source/output hashes and CSP.
- `operations/verify-live.mjs`: read-only GET, language-query GET and HEAD checks at a supplied URL.

The Next.js route serves only the new product page. It preserves the bundled document's exact bytes and hash-based CSP. No separate asset routes, DNS changes, Cloudflare account access, database, secrets or model credentials are required.

## Checks and preview

This subproject requires Node.js 22 or newer and has no dependencies:

```bash
cd sites/anc
npm run build
npm run check
npm test
npm run dev
```

Regenerate `release/` after source changes; do not edit generated files directly. The standalone preview serves the document at its local root. To check the integrated path, use the main repository's normal Next.js development server and open `/ai-native-company`.

From the repository root, `npm run test:anc` covers the main app route and this package. Run the main app's required checks and build before merging. Merging the reviewed changes to `master` uses the existing Vercel pipeline.

Production verification, from this directory:

```bash
node operations/verify-live.mjs https://ha7ch.com/ai-native-company
```

The verifier also accepts an origin-only URL for the legacy root preview. It does not follow redirects or probe unrelated application routes. See [DEPLOYMENT.zh-CN.md](DEPLOYMENT.zh-CN.md) for release checks and rollback, or [HANDOFF.zh-CN.md](HANDOFF.zh-CN.md) for a short summary.

## Legacy Worker compatibility

`integration/homepage-handler.mjs` and `integration/worker-example.md` remain available for the former subdomain integration. That optional helper still limits handling to root GET/HEAD on its explicit host allowlist. The new Next.js route imports the document exports directly and does not call that helper.

## Product scope

Current execution and prototypes are distinguished from development work. The page uses no backend, analytics, lead form, external fonts or external scripts. Language preference stays in the visitor's browser. The package contains public product copy, with no private customer contracts, credentials or runtime data.
