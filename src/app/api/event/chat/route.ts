import { NextResponse } from "next/server";
import { createStore } from "@/lib/event/store";
import { handleTurn, type LLMConfig } from "@/lib/event/engine";

// Server-side: runs the full screening/picker logic against Supabase + DeepSeek and returns the
// bot's reply lines. Same engine the WeChat bridge will call; this is the browser test channel.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function llmFromEnv(): LLMConfig {
  return {
    apiKey: process.env.DEEPSEEK_API_KEY ?? "",
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      userId?: unknown;
      text?: unknown;
      channel?: unknown;
      secret?: unknown;
    };
    const userId = typeof body.userId === "string" && body.userId.trim() !== "" ? body.userId : null;
    const text = typeof body.text === "string" ? body.text : "";
    if (!userId) return NextResponse.json({ error: "missing userId" }, { status: 400 });

    // The WeChat worker bridges its inbound messages here as channel="wechat"; gate that on a shared
    // secret so only the worker can submit turns impersonating a WeChat user. Web chat stays open.
    const channel: "web" | "wechat" = body.channel === "wechat" ? "wechat" : "web";
    if (channel === "wechat") {
      const expected = process.env.EVENT_BRIDGE_SECRET;
      if (!expected || body.secret !== expected) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
    }

    const llm = llmFromEnv();
    if (!llm.apiKey) return NextResponse.json({ error: "DEEPSEEK_API_KEY 未配置" }, { status: 500 });

    const store = createStore();
    const replies = await handleTurn(store, llm, userId, channel, text);
    return NextResponse.json({ replies });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
