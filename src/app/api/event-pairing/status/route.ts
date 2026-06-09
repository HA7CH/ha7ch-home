import { PAIRING_WORKER_ORIGIN } from "@/lib/event/pairing";

// Same-origin proxy for the worker's pairing-status endpoint, so the event page can poll it from
// the browser without the worker needing CORS. Pass-through: returns the worker's JSON
// ({ status, qr_url? }) verbatim.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = new URL(req.url).searchParams.get("s") || "";
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(s)) {
    return Response.json({ status: "error" }, { status: 400 });
  }
  try {
    const r = await fetch(`${PAIRING_WORKER_ORIGIN}/apply/status?s=${encodeURIComponent(s)}`, {
      cache: "no-store",
    });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch {
    return Response.json({ status: "error" }, { status: 502 });
  }
}
