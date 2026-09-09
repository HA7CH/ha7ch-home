# HA7CH agent readiness checks

Use Node.js 22.20 or newer. Run `npm test` for Accept negotiation unit tests.

After `npm run build` and `npm start -- -p 3001`:

```sh
npm run test:endpoints
node --test tests/image-routes.test.mjs
```

For the deployed website:

```sh
BASE_URL=https://ha7ch.com npm run test:endpoints
BASE_URL=https://ha7ch.com node --test tests/image-routes.test.mjs
```

Endpoint tests cover negotiated HTML/Markdown, quality values, cache separation,
HEAD, real 404s, explicit Markdown URLs, trust pages, structured contact details,
every local llms.txt link, every sitemap URL, robots, assets, existing redirects,
and React Flight. Image tests verify PNG output from the routes whose invalid
Next.js exports were removed. Production tests also require the canonical apex
domain to serve directly and www to redirect permanently to it.

The Vercel project domain configuration is external to the repository:
`ha7ch.com` serves production directly; `www.ha7ch.com` redirects to it with 308.
This matches the site's canonical metadata and sitemap URLs.

Remaining external inputs: an approved public organization address; search-engine
indexing and Search Console/Bing Webmaster ownership for submission and monitoring.
The repository's existing ESLint 10 / eslint-plugin-react incompatibility prevents
`npm run lint` from running; build/type checks and the above tests are separate.

`vercel.json` uses a final `response.headers` transform to append `Accept` to
`Vary` while preserving Next.js's existing Flight headers. Ordinary Proxy or
next.config headers are overwritten for prerendered HTML on Vercel; the public
endpoint test intentionally checks both representations. Markdown responses are
private/no-store and are returned before the CDN cache by Next.js Proxy.
