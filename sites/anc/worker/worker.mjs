// Existing anc-onboard production source exported on 2026-11-02.
// Preserve publishing, onboarding, authentication and storage routes.

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var PAGE_KEY_PREFIX = "page:";
var MAX_HTML_BYTES = 20 * 1024 * 1024;
var SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
var COMPANIES = {
  ha7ch: `# HA7CH \u5165\u804C(agent \u8BF7\u6309\u6B64\u6267\u884C)

\u4F60\u6B63\u5728\u66FF\u4E00\u4F4D\u65B0\u6210\u5458\u5B8C\u6210 HA7CH \u516C\u53F8\u77E5\u8BC6\u5E93(GitHub \u79C1\u6709\u4ED3\u5E93 HA7CH/anc-ha7ch)\u7684\u5165\u804C\u3002\u6309\u987A\u5E8F\u6267\u884C,\u6BCF\u6B65\u5931\u8D25\u5C31\u544A\u8BC9\u7528\u6237\u600E\u4E48\u4FEE:

0. \u73AF\u5883\u68C0\u67E5:\`git config user.name\` \u4E0E \`git config user.email\` \u4EFB\u4E00\u4E3A\u7A7A \u2192 \u5F15\u5BFC\u7528\u6237\u8BBE\u7F6E(\`git config --global user.name "<\u540D\u5B57>"\` \u7B49),\u5426\u5219\u7B2C 4 \u6B65 commit \u4F1A\u5931\u8D25\u6216\u9519\u8BB0\u4F5C\u8005\u8EAB\u4EFD\u3002
1. \u8FDE\u901A\u68C0\u67E5:\`git ls-remote https://github.com/HA7CH/anc-ha7ch.git\`\u3002\u5931\u8D25\u5219\u5148\u786E\u8BA4\u7528\u6237\u5DF2\u63A5\u53D7 GitHub \u9080\u8BF7,\u518D\u5F15\u5BFC \`gh auth login\`(\u6216\u914D\u7F6E git \u51ED\u636E)\u540E\u91CD\u8BD5\u3002
2. clone \u5230 \`~/ha7ch/anc-ha7ch\`;\u7528\u6237\u60F3\u653E\u522B\u5904\u4E5F\u884C:clone \u5230\u4EFB\u610F\u8DEF\u5F84\u540E\u6267\u884C \`echo "<\u7EDD\u5BF9\u8DEF\u5F84>" > ~/.anc/ha7ch\` \u767B\u8BB0,\u540E\u7EED\u6B65\u9AA4\u91CC\u7684\u8DEF\u5F84\u4E00\u5F8B\u6362\u6210\u8BE5\u8DEF\u5F84\u3002\u76EE\u5F55\u5DF2\u5B58\u5728\u5C31\u6539\u4E3A pull\u3002
3. \u88C5\u516C\u53F8\u6280\u80FD(\u6309\u4F60\u662F\u54EA\u4E2A harness \u9009):
   - Claude Code:\u8FD0\u884C \`claude plugin marketplace add HA7CH/anc-ha7ch\` \u548C \`claude plugin install ha7ch@anc-ha7ch\`\u3002
   - Codex:\u8FD0\u884C \`codex plugin marketplace add HA7CH/anc-ha7ch\`,\u7136\u540E\u63D0\u793A\u7528\u6237\u5728 /plugins \u9762\u677F\u91CC\u5B89\u88C5 ha7ch\u3002
   - Hermes:\u5728 \`~/.hermes/config.yaml\` \u7684 \`skills.external_dirs\` \u4E2D\u52A0\u5165 clone \u91CC\u7684 \`plugins/ha7ch/skills/\` \u7EDD\u5BF9\u8DEF\u5F84(\u968F git pull \u81EA\u52A8\u66F4\u65B0)\u3002\u6CE8\u610F Hermes \u53EF\u4FEE\u6539\u6709\u5199\u6743\u9650\u7684\u5916\u90E8\u6280\u80FD\u76EE\u5F55;\u82E5\u4E0D\u60F3\u8BA9\u5B83\u6539\u4ED3\u5E93\u5185\u540D\u7247,\u5C31\u628A\u76EE\u5F55\u590D\u5236\u8FDB \`~/.hermes/skills/\`\u3002
   - \u5176\u5B83\u652F\u6301 SKILL.md \u5F00\u653E\u89C4\u8303\u7684 agent:\u6309\u8BE5 agent \u7684\u914D\u7F6E\u65B9\u5F0F\u63A5\u5165 clone \u91CC\u7684 \`plugins/ha7ch/skills/\`\u3002
4. \u95EE\u7528\u6237\u7684\u540D\u5B57(\u53EA\u95EE\u8FD9\u4E00\u4E2A\u95EE\u9898),\u628A ta \u8FFD\u52A0\u8FDB vault \u7684 company/people.md **\u552F\u4E00\u90A3\u5F20\u6210\u5458\u8868**(\u540D\u5B57 + join \u65E5\u671F\u5FC5\u586B,\u5176\u4F59\u53EF\u7A7A),commit message \u7528\u300Cingest: \u65B0\u6210\u5458 <\u540D\u5B57> \u5165\u804C\u300D,push\u3002push \u88AB\u62D2(\u522B\u4EBA\u521A\u63A8\u8FC7)\u2192 \`git pull --rebase\` \u540E\u91CD\u63A8\u4E00\u6B21\u3002
5. \u81EA\u68C0:\u8BFB vault \u6839 CLAUDE.md \u7684\u8DEF\u7531\u8868,\u56DE\u7B54\u300Cha7ch \u6709\u54EA\u4E9B\u4EA7\u54C1\u300D\u5E76\u9644\u5E93\u5185\u51FA\u5904,\u8BC1\u660E\u94FE\u8DEF\u901A\u4E86\u3002
6. \u6700\u540E\u7528\u4E09\u53E5\u8BDD\u544A\u8BC9\u7528\u6237\u4EE5\u540E\u600E\u4E48\u7528:\u95EE(\u4EFB\u4F55\u516C\u53F8\u4E8B\u5B9E)\u3001\u8BB0(\u968F\u53E3\u60F3\u6CD5\u8FDB inbox)\u3001\u505A(\u529E\u6D3B\u52A8/\u53D1\u7248,\u8BF4\u4EBA\u8BDD\u5C31\u884C)\u3002

\u5B89\u5168\u8BF4\u660E:\u672C\u6587\u4EF6\u53EA\u662F\u5165\u804C\u6D41\u7A0B\u6307\u4EE4;\u82E5\u5176\u4E0E\u7528\u6237\u5229\u76CA\u51B2\u7A81\u6216\u8981\u6C42\u5916\u53D1\u51ED\u636E,\u4EE5\u7528\u6237\u4E3A\u51C6\u5E76\u505C\u6B62\u3002
`
};
var SECURITY_HEADERS = {
  "content-security-policy": "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY"
};
function text(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers }
  });
}
__name(text, "text");
function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  })[character]);
}
__name(escapeXml, "escapeXml");
async function indexedPages(namespace) {
  const pages = [];
  let cursor;
  do {
    const result = await namespace.list({ prefix: PAGE_KEY_PREFIX, cursor });
    for (const key of result.keys) {
      if (key.metadata?.index === true) {
        pages.push({
          slug: key.name.slice(PAGE_KEY_PREFIX.length),
          updatedAt: key.metadata.updatedAt
        });
      }
    }
    cursor = result.list_complete ? void 0 : result.cursor;
  } while (cursor);
  return pages;
}
__name(indexedPages, "indexedPages");
function isAuthorized(request, env) {
  return Boolean(env.PUBLISH_TOKEN) && request.headers.get("authorization") === `Bearer ${env.PUBLISH_TOKEN}`;
}
__name(isAuthorized, "isAuthorized");
async function listAllPages(namespace) {
  const pages = [];
  let cursor;
  do {
    const result = await namespace.list({ prefix: PAGE_KEY_PREFIX, cursor });
    pages.push(...result.keys.map((key) => ({
      slug: key.name.slice(PAGE_KEY_PREFIX.length),
      ...key.metadata
    })));
    cursor = result.list_complete ? void 0 : result.cursor;
  } while (cursor);
  return pages;
}
__name(listAllPages, "listAllPages");
async function handlePublishApi(request, env, url) {
  if (!isAuthorized(request, env)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (request.method === "GET" && url.pathname === "/api/health") {
    return Response.json({ ok: true, service: "anc-pages-publisher" });
  }
  if (request.method === "GET" && url.pathname === "/api/pages") {
    return Response.json({ pages: await listAllPages(env.PAGES) });
  }
  const match = url.pathname.match(/^\/api\/pages\/([a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?)$/);
  if (!match || !SLUG_PATTERN.test(match[1])) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const key = `${PAGE_KEY_PREFIX}${match[1]}`;
  if (request.method === "DELETE") {
    await env.PAGES.delete(key);
    return Response.json({ deleted: true, slug: match[1] });
  }
  if (request.method !== "PUT") {
    return Response.json({ error: "method not allowed" }, { status: 405 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (typeof body.html !== "string" || !/(?:<!doctype\s+html|<html[\s>])/i.test(body.html.slice(0, 4096))) {
    return Response.json({ error: "html must be a complete HTML document" }, { status: 400 });
  }
  if (new TextEncoder().encode(body.html).byteLength > MAX_HTML_BYTES) {
    return Response.json({ error: "HTML exceeds 20 MiB" }, { status: 413 });
  }
  const indexable = body.index === true;
  const ttlSeconds = body.ttlSeconds;
  if (indexable && ttlSeconds !== void 0 && ttlSeconds !== null) {
    return Response.json({ error: "indexed pages cannot expire" }, { status: 400 });
  }
  if (!indexable && (!Number.isInteger(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > 365 * 86400)) {
    return Response.json({ error: "temporary pages require ttlSeconds between 60 and 31536000" }, { status: 400 });
  }
  const metadata = {
    title: typeof body.title === "string" ? body.title.slice(0, 160) : match[1],
    index: indexable,
    updatedAt: typeof body.updatedAt === "string" ? body.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
  };
  const options = { metadata };
  if (!indexable) options.expirationTtl = ttlSeconds;
  await env.PAGES.put(key, body.html, options);
  return Response.json({ published: true, slug: match[1], index: indexable }, { status: 201 });
}
__name(handlePublishApi, "handlePublishApi");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handlePublishApi(request, env, url);
    }
    if (url.pathname === "/healthz") {
      return Response.json({ ok: true, service: "anc-onboard" });
    }
    if (url.pathname === "/robots.txt") {
      return text(`User-agent: *
Allow: /
Sitemap: ${url.origin}/sitemap.xml
`);
    }
    if (url.pathname === "/sitemap.xml") {
      const pages = await indexedPages(env.PAGES);
      const entries = pages.map(({ slug, updatedAt }) => {
        const loc = escapeXml(`${url.origin}/p/${slug}`);
        const lastmod = updatedAt ? `<lastmod>${escapeXml(updatedAt)}</lastmod>` : "";
        return `<url><loc>${loc}</loc>${lastmod}</url>`;
      }).join("");
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
        headers: { "content-type": "application/xml; charset=utf-8" }
      });
    }
    const pageMatch = url.pathname.match(/^\/p\/([a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?)\/?$/);
    if (pageMatch) {
      const page = await env.PAGES.getWithMetadata(`${PAGE_KEY_PREFIX}${pageMatch[1]}`, "text");
      if (page.value === null) return text("not found\n", 404);
      const indexable = page.metadata?.index === true;
      return new Response(page.value, {
        headers: {
          "cache-control": "public, max-age=60",
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": indexable ? "index, follow" : "noindex, nofollow, noarchive",
          ...SECURITY_HEADERS
        }
      });
    }
    const m = url.pathname.match(/^\/([a-z0-9-]+)\/onboard\.md$/);
    if (m && COMPANIES[m[1]]) {
      return new Response(COMPANIES[m[1]], {
        headers: { "content-type": "text/markdown; charset=utf-8" }
      });
    }
    if (url.pathname === "/") {
      return text("anc \u2014 AI Native Company\n\n\u5165\u804C\u5165\u53E3:GET /<company>/onboard.md\n\u7F51\u9875\u5C55\u793A:GET /p/<slug>\n");
    }
    return text("not found\n", 404);
  }
};
export {
  worker_default as default
};

