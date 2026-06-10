import { NextResponse } from "next/server";
import { createStore } from "@/lib/event/store";
import { finalizeStaleScreening } from "@/lib/event/engine";

// 把「正在聊」里长时间无新消息的人强制定稿到 通过/候补/婉拒。可被外部定时器（如 worker cron、
// Vercel Cron、cron-job.org）或人工 curl 触发，与 chat 路由里限频的顺手扫尾互为补充。
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 鉴权：Authorization: Bearer <token>，或 query/?secret= / ?token= 带值。
// 接受 EVENT_ADMIN_TOKEN（主办）或 EVENT_BRIDGE_SECRET（worker），任一匹配即放行。
function authorized(req: Request, url: URL): boolean {
  const adminToken = process.env.EVENT_ADMIN_TOKEN;
  const bridge = process.env.EVENT_BRIDGE_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const q = url.searchParams.get("secret") ?? url.searchParams.get("token") ?? "";
  const hit = (v?: string) => !!v && (bearer === v || q === v);
  return hit(adminToken) || hit(bridge);
}

async function run(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  if (!authorized(req, url)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // 可选：?idle_hours=N 覆盖默认 12 小时（用于手动一次性收紧/放宽）。
  const hours = Number(url.searchParams.get("idle_hours"));
  const idleMs = Number.isFinite(hours) && hours > 0 ? hours * 3600_000 : undefined;
  const store = createStore();
  const finalized = await finalizeStaleScreening(store, idleMs);
  return NextResponse.json({ ok: true, finalized });
}

export async function POST(req: Request) {
  try {
    return await run(req);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    return await run(req);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
