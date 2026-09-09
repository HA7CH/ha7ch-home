import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { negotiate, markdownResponse, recoveryMarkdown } from "@/lib/content-negotiation";
import { supportsMarkdown, siteMarkdown } from "@/lib/site-markdown";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host.startsWith("raily.lawted.tech") || host.startsWith("raily.ha7ch.com")) {
    return NextResponse.redirect(
      "https://apps.apple.com/app/raily-live-train-tracker/id6764391867",
      { status: 301 }
    );
  }

  const path = request.nextUrl.pathname;
  // React navigation and prefetch responses retain Next.js Flight semantics.
  if (!["GET", "HEAD"].includes(request.method) || request.headers.has("rsc") || request.headers.has("next-router-prefetch")) return NextResponse.next();
  const alias = path === "/index.md" ? "/" : path.endsWith(".md") ? path.slice(0, -3) : null;
  if (alias !== null && supportsMarkdown(alias)) {
    const body = siteMarkdown(alias);
    return markdownResponse(body ?? recoveryMarkdown, body ? 200 : 404, body ? `https://ha7ch.com${alias}` : undefined);
  }
  if (!supportsMarkdown(path)) return NextResponse.next();
  const format = negotiate(request.headers.get("accept"));
  if (format === null) return new NextResponse("Not acceptable. Request text/html or text/markdown.\n", { status: 406, headers: { "Content-Type": "text/plain; charset=utf-8", Vary: "Accept", "Cache-Control": "private, no-store" } });
  const headers = { Vary: "Accept, Accept-Encoding", Link: `<https://ha7ch.com${path === "/" ? "/index" : path}.md>; rel="alternate"; type="text/markdown", <https://ha7ch.com/llms.txt>; rel="describedby"` };
  if (format === "markdown") {
    const body = siteMarkdown(path);
    return markdownResponse(body ?? recoveryMarkdown, body ? 200 : 404, body ? `https://ha7ch.com${path}` : undefined);
  }
  return NextResponse.next({ headers });
}

export const config = {
  matcher: "/:path*"
};
