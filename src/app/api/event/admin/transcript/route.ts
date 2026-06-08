import { NextResponse } from "next/server";
import { createStore } from "@/lib/event/store";

// One person's full conversation in one event. Token-gated.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!process.env.EVENT_ADMIN_TOKEN || token !== process.env.EVENT_ADMIN_TOKEN)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const eventId = url.searchParams.get("event_id");
  const userId = url.searchParams.get("user_id");
  if (!eventId || !userId) return NextResponse.json({ error: "missing event_id/user_id" }, { status: 400 });
  try {
    const store = createStore();
    const turns = await store.loadFullTranscript(eventId, userId);
    return NextResponse.json({ turns });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
