import Negotiator from "negotiator";

/** RFC 9110 media ranges, parameters and quality precedence. */
export function negotiate(accept: string | null): "html" | "markdown" | null {
  const mediaType = new Negotiator({ headers: { accept: accept?.trim() || "*/*" } }).mediaType([
    "text/html; charset=utf-8", "text/markdown; charset=utf-8"
  ]);
  return mediaType?.startsWith("text/markdown") ? "markdown" : mediaType?.startsWith("text/html") ? "html" : null;
}

export const recoveryMarkdown = `# 404 — Page not found\n\nThis HA7CH URL does not exist. Do not treat it as a valid resource.\n\n- [HA7CH home](https://ha7ch.com/)\n- [Agent guide](https://ha7ch.com/llms.txt)\n- [Developer resources](https://ha7ch.com/docs)\n- [Sitemap](https://ha7ch.com/sitemap.xml)\n- [Contact](https://ha7ch.com/contact)\n`;

export function markdownResponse(body: string, status = 200, canonical?: string) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept, Accept-Encoding",
      // Keep negotiated variants out of shared caches.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Link": `${canonical ? `<${canonical}>; rel="canonical", ` : ""}<https://ha7ch.com/llms.txt>; rel="describedby"`,
      ...(status === 404 ? { "X-Robots-Tag": "noindex" } : {})
    }
  });
}
