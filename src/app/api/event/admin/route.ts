import { NextResponse } from "next/server";
import { createStore } from "@/lib/event/store";

// Read-only cross-event board + human override. Token-gated (EVENT_ADMIN_TOKEN).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed(token: string | null): boolean {
  const expected = process.env.EVENT_ADMIN_TOKEN;
  return !!expected && token === expected;
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!authed(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const store = createStore();
    const [events, applications] = await Promise.all([store.listEvents(), store.listAllApplications()]);
    return NextResponse.json({ events, applications });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

const ACTIONS: Record<string, { stage: "accepted" | "waitlisted" | "rejected"; decision: string }> = {
  accept: { stage: "accepted", decision: "accept" },
  waitlist: { stage: "waitlisted", decision: "waitlist" },
  reject: { stage: "rejected", decision: "reject" },
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      token?: unknown;
      event_id?: unknown;
      user_id?: unknown;
      action?: unknown;
    };
    if (!authed(typeof body.token === "string" ? body.token : null))
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (typeof body.event_id !== "string" || typeof body.user_id !== "string")
      return NextResponse.json({ error: "missing event_id/user_id" }, { status: 400 });
    const target = ACTIONS[String(body.action)];
    if (!target) return NextResponse.json({ error: "bad action" }, { status: 400 });

    const store = createStore();
    // Accepting assigns a per-event seat (idempotent). Note: pushing the invite/address to the
    // person happens later via the WeChat bridge + the unified notify step, never auto here.
    if (body.action === "accept") await store.claimSeat(body.event_id, body.user_id);
    await store.patchApplication(body.event_id, body.user_id, { ...target, human_decided: 1 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
