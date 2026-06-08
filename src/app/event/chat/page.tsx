"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "bot"; text: string };

const GREETING =
  "你好，我是 HA7CH 的 bouncer。你想报哪一场？直接跟我说就行，比如「上海」。";

export default function EventChatPage() {
  const [userId, setUserId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([{ role: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Stable per-browser applicant id (a fresh "person" each time you reset).
  useEffect(() => {
    const KEY = "event_web_uid";
    let v = localStorage.getItem(KEY);
    if (!v) {
      v = "web-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(KEY, v);
    }
    setUserId(v);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy || !userId) return;
    setInput("");
    setError("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const r = await fetch("/api/event/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      const replies: string[] = Array.isArray(data.replies) ? data.replies : [];
      for (const reply of replies) setMessages((m) => [...m, { role: "bot", text: reply }]);
      if (replies.length === 0) setMessages((m) => [...m, { role: "bot", text: "（没有回复）" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    localStorage.removeItem("event_web_uid");
    const v = "web-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("event_web_uid", v);
    setUserId(v);
    setMessages([{ role: "bot", text: GREETING }]);
    setError("");
  }

  return (
    <main className="ec-wrap">
      <header className="ec-head">
        <div>
          <h1>bouncer · 测试对话</h1>
          <p className="ec-sub">浏览器里直连同一套筛选逻辑（DeepSeek + Supabase），不走微信。</p>
        </div>
        <button className="ec-reset" onClick={reset} title="换一个全新的报名人重新开始">
          换个人重来
        </button>
      </header>

      <div className="ec-stream" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`ec-row ${m.role}`}>
            <div className={`ec-bubble ${m.role}`}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div className="ec-row bot">
            <div className="ec-bubble bot ec-typing">bouncer 在想…</div>
          </div>
        )}
      </div>

      {error && <p className="ec-error">出错了：{error}</p>}

      <div className="ec-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="像在微信里那样跟 bouncer 聊…（Enter 发送，Shift+Enter 换行）"
          rows={2}
        />
        <button onClick={send} disabled={busy || !input.trim()}>
          发送
        </button>
      </div>
      <p className="ec-uid">applicant: {userId || "…"}</p>

      <style>{`
        .ec-wrap { max-width: 40rem; margin: 0 auto; padding: 2.5rem 1.25rem 2rem;
          font-family: "Inter", -apple-system, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
          color: #111; display: flex; flex-direction: column; min-height: 100vh; }
        .ec-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
          padding-bottom: 1.25rem; border-bottom: 1px solid #ededea; margin-bottom: 1rem; }
        .ec-head h1 { font-size: 1.1rem; font-weight: 600; letter-spacing: -0.01em; }
        .ec-sub { font-size: 0.8rem; color: #999; margin-top: 0.25rem; }
        .ec-reset { flex: 0 0 auto; font-size: 0.78rem; color: #555; background: #f4f4f1;
          border: 1px solid #e2e2dd; border-radius: 2rem; padding: 0.4rem 0.85rem; cursor: pointer; }
        .ec-reset:hover { background: #ececea; color: #111; }
        .ec-stream { flex: 1 1 auto; overflow-y: auto; display: flex; flex-direction: column;
          gap: 0.6rem; padding: 0.5rem 0 1rem; }
        .ec-row { display: flex; }
        .ec-row.user { justify-content: flex-end; }
        .ec-bubble { max-width: 82%; padding: 0.65rem 0.9rem; border-radius: 1rem; font-size: 0.92rem;
          line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
        .ec-bubble.bot { background: #f4f4f1; color: #222; border-bottom-left-radius: 0.25rem; }
        .ec-bubble.user { background: #111; color: #fdfdfc; border-bottom-right-radius: 0.25rem; }
        .ec-typing { color: #999; font-style: italic; }
        .ec-error { font-size: 0.8rem; color: #b04030; margin: 0.25rem 0; }
        .ec-input { display: flex; gap: 0.6rem; align-items: flex-end;
          border-top: 1px solid #ededea; padding-top: 1rem; }
        .ec-input textarea { flex: 1 1 auto; resize: none; border: 1px solid #e2e2dd; border-radius: 0.75rem;
          padding: 0.6rem 0.8rem; font: inherit; font-size: 0.92rem; line-height: 1.5; outline: none; }
        .ec-input textarea:focus { border-color: #111; }
        .ec-input button { flex: 0 0 auto; background: #111; color: #fdfdfc; border: none;
          border-radius: 0.75rem; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
        .ec-input button:disabled { opacity: 0.4; cursor: default; }
        .ec-uid { font-size: 0.7rem; color: #ccc; margin-top: 0.6rem; text-align: right;
          font-variant-numeric: tabular-nums; }
      `}</style>
    </main>
  );
}
