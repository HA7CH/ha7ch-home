import { markdownResponse, recoveryMarkdown, negotiate } from "@/lib/content-negotiation";
export function GET(request: Request) {
  if (request.headers.get("accept")?.includes("text/html") && negotiate(request.headers.get("accept")) === "html") {
    return new Response(`<!doctype html><html lang="en"><head><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 · HA7CH</title></head><body style="font-family:system-ui,sans-serif;max-width:640px;margin:15vh auto;padding:24px;line-height:1.7"><h1>404</h1><p>This page could not be found.</p><p><a href="/">HA7CH home</a> · <a href="/docs">Docs</a> · <a href="/llms.txt">Agent guide</a> · <a href="/sitemap.xml">Sitemap</a></p></body></html>`, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", Vary: "Accept", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
  }
  return markdownResponse(recoveryMarkdown, 404);
}
