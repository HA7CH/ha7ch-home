import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host.startsWith("raily.lawted.tech") || host.startsWith("raily.ha7ch.com")) {
    return NextResponse.redirect(
      "https://apps.apple.com/app/raily-live-train-tracker/id6764391867",
      { status: 301 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*"
};
