"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Row = {
  event_id: string;
  event_name: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  channel: string;
  stage: string;
  decision: string | null;
  score_project: number;
  score_scene: number;
  score_resource: number;
  score_thinking: number;
  confidence: number;
  faction: string | null;
  needs_human_review: number;
  human_decided: number;
  seat_no: number | null;
  turn_count: number;
  today_problem: string | null;
  wants_to_meet: string | null;
  summary: string | null;
  updated_at: number;
};
type EventInfo = { event_id: string; name: string; status: string; seat_total: number };
type Turn = { role: "user" | "assistant"; content: string; raw: string | null; scorecard_json: string | null; created_at: number };

const STAGE_LABEL: Record<string, string> = {
  screening: "筛选中",
  accepted: "已通过",
  checked_in: "已签到",
  waitlisted: "候补",
  rejected: "婉拒",
};
const STAGE_ORDER = ["accepted", "checked_in", "waitlisted", "screening", "rejected"];
const FACTION_LABEL: Record<string, string> = {
  // 派系真实取值（评分卡里的 faction_primary）
  tech: "技术",
  founder: "创业",
  scene: "场景",
  research: "研究",
  // 兼容旧/别名字段
  project: "技术",
  resource: "资源",
  thinking: "研究",
};

export default function EventAdminPage() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fEvent, setFEvent] = useState("all");
  const [fStage, setFStage] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (t) {
      setToken(t);
      setTokenInput(t);
    }
  }, []);

  const load = useCallback(async (tok: string) => {
    if (!tok) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/event/admin?token=${encodeURIComponent(tok)}`, { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setEvents(data.events ?? []);
      setRows(data.applications ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  async function override(row: Row, action: "accept" | "waitlist" | "reject") {
    try {
      const r = await fetch("/api/event/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, event_id: row.event_id, user_id: row.user_id, action }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      load(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const [viewing, setViewing] = useState<Row | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [turnsLoading, setTurnsLoading] = useState(false);

  async function openTranscript(row: Row) {
    setViewing(row);
    setTurns([]);
    setTurnsLoading(true);
    try {
      const r = await fetch(
        `/api/event/admin/transcript?token=${encodeURIComponent(token)}&event_id=${encodeURIComponent(
          row.event_id,
        )}&user_id=${encodeURIComponent(row.user_id)}`,
        { cache: "no-store" },
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setTurns(data.turns ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTurnsLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => (fEvent === "all" ? true : r.event_id === fEvent))
      .filter((r) => (fStage === "all" ? true : r.stage === fStage))
      .filter((r) =>
        !needle
          ? true
          : [r.display_name, r.phone, r.user_id, r.today_problem, r.summary].some((v) =>
              (v ?? "").toLowerCase().includes(needle),
            ),
      )
      .sort((a, b) => {
        const s = STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
        return s !== 0 ? s : (a.seat_no ?? 999) - (b.seat_no ?? 999);
      });
  }, [rows, fEvent, fStage, q]);

  const counts = useMemo(() => {
    const scope = fEvent === "all" ? rows : rows.filter((r) => r.event_id === fEvent);
    const by: Record<string, number> = {};
    for (const r of scope) by[r.stage] = (by[r.stage] ?? 0) + 1;
    const people = new Set(scope.map((r) => r.user_id)).size;
    return { by, people, apps: scope.length };
  }, [rows, fEvent]);

  if (!token) {
    return (
      <main className="ad-gate">
        <h1>报名总览</h1>
        <p>输入主办口令查看。</p>
        <div className="ad-gate-row">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setToken(tokenInput)}
            placeholder="ADMIN token"
          />
          <button onClick={() => setToken(tokenInput)}>进入</button>
        </div>
        {error && <p className="ad-err">{error}</p>}
        <style>{gateCss}</style>
      </main>
    );
  }

  return (
    <main className="ad-wrap">
      <header className="ad-head">
        <h1>HA7CH 报名总览</h1>
        <button className="ad-refresh" onClick={() => load(token)} disabled={loading}>
          {loading ? "刷新中…" : "刷新"}
        </button>
      </header>

      <div className="ad-stat">
        <span><b>{counts.people}</b> 人</span>
        <span><b>{counts.apps}</b> 条报名</span>
        <span className="ok"><b>{counts.by.accepted ?? 0}</b> 通过</span>
        <span><b>{counts.by.screening ?? 0}</b> 筛选中</span>
        <span className="warn"><b>{counts.by.waitlisted ?? 0}</b> 候补</span>
        <span className="mute"><b>{counts.by.rejected ?? 0}</b> 婉拒</span>
      </div>

      <div className="ad-filters">
        <select value={fEvent} onChange={(e) => setFEvent(e.target.value)}>
          <option value="all">全部活动</option>
          {events.map((ev) => (
            <option key={ev.event_id} value={ev.event_id}>
              {ev.name}（{ev.status}）
            </option>
          ))}
        </select>
        <select value={fStage} onChange={(e) => setFStage(e.target.value)}>
          <option value="all">全部状态</option>
          {Object.entries(STAGE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜代称 / 手机 / 问题…" />
      </div>

      {error && <p className="ad-err">{error}</p>}

      <div className="ad-table">
        <div className="ad-tr ad-thead">
          <div className="c-name">代称</div>
          <div className="c-sum">小结</div>
          <div className="c-phone">联系</div>
          <div className="c-event">活动</div>
          <div className="c-stage">状态</div>
          <div className="c-fac">派</div>
          <div className="c-score">四维 P/S/R/T</div>
          <div className="c-seat">座</div>
          <div className="c-act">人工改判</div>
        </div>
        {filtered.map((r) => {
          const total = r.score_project + r.score_scene + r.score_resource + r.score_thinking;
          return (
            <div className="ad-tr" key={`${r.event_id}:${r.user_id}`}>
              <div className="c-name clickable" onClick={() => openTranscript(r)} title="点开看完整对话">
                <span className="nm">{r.display_name || <span className="mute">未留名</span>} 💬</span>
                <span className="uid">{r.channel === "wechat" ? "微信" : "网页"}</span>
              </div>
              <div className="c-sum" title={r.summary || ""}>
                {r.summary || <span className="mute">—</span>}
              </div>
              <div className="c-phone">{r.phone || <span className="mute">—</span>}</div>
              <div className="c-event" title={r.event_name}>{r.event_name}</div>
              <div className="c-stage">
                <span className={`pill st-${r.stage}`}>{STAGE_LABEL[r.stage] ?? r.stage}</span>
                {r.human_decided ? <span className="byhand" title="人工改判过">手</span> : null}
                {r.needs_human_review ? <span className="needrev" title="待人工复核">复核</span> : null}
              </div>
              <div className="c-fac">{r.faction ? FACTION_LABEL[r.faction] ?? r.faction : "—"}</div>
              <div className="c-score">
                <span className="nums">
                  {r.score_project}/{r.score_scene}/{r.score_resource}/{r.score_thinking}
                </span>
                <span className="total">共 {total}</span>
              </div>
              <div className="c-seat">{r.seat_no ?? "—"}</div>
              <div className="c-act">
                <button className="b-ok" onClick={() => override(r, "accept")} disabled={r.stage === "accepted"}>
                  通过
                </button>
                <button className="b-wl" onClick={() => override(r, "waitlist")} disabled={r.stage === "waitlisted"}>
                  候补
                </button>
                <button className="b-no" onClick={() => override(r, "reject")} disabled={r.stage === "rejected"}>
                  婉拒
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !loading && <div className="ad-empty">没有符合条件的报名。</div>}
      </div>

      <p className="ad-note">
        提示：点代称可看完整对话。通过只分配座位、不发地址。地址由你们之后通过统一通知发出（微信桥接上线后这里会加「群发通知」）。
      </p>

      {viewing && (
        <div className="tx-overlay" onClick={() => setViewing(null)}>
          <div className="tx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tx-head">
              <div className="tx-title">
                <b>{viewing.display_name || viewing.user_id}</b>
                <span className="tx-meta">
                  {viewing.event_name} · {STAGE_LABEL[viewing.stage] ?? viewing.stage}
                  {viewing.phone ? ` · ${viewing.phone}` : ""}
                </span>
                {viewing.summary ? <p className="tx-summary">{viewing.summary}</p> : null}
              </div>
              <button onClick={() => setViewing(null)}>关闭</button>
            </div>
            <div className="tx-body">
              {turnsLoading && <p className="mute">加载中…</p>}
              {!turnsLoading && turns.length === 0 && <p className="mute">还没有对话记录。</p>}
              {turns.map((t, i) => (
                <div key={i} className={`tx-turn ${t.role}`}>
                  <div className={`tx-bubble ${t.role}`}>{t.content}</div>
                  {t.role === "assistant" && t.scorecard_json ? <ScoreDetail json={t.scorecard_json} /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{boardCss}</style>
    </main>
  );
}

function ScoreDetail({ json }: { json: string }) {
  let sc: { scores?: Record<string, number>; decision?: string; confidence?: number; faction_primary?: string; faction_secondary?: string; probe_result?: string; red_flags?: string[]; reason_internal?: string };
  try {
    sc = JSON.parse(json);
  } catch {
    return null;
  }
  const s = sc.scores ?? {};
  const flags = Array.isArray(sc.red_flags) && sc.red_flags.length ? sc.red_flags.join("、") : "无";
  return (
    <details className="tx-sc">
      <summary>
        bot 评分：{sc.decision} · P{s.project ?? 0}/S{s.scene ?? 0}/R{s.resource ?? 0}/T{s.thinking ?? 0} · 置信 {sc.confidence}
      </summary>
      <div className="tx-sc-row">
        派系：{sc.faction_primary}（次：{sc.faction_secondary}）· 追问：{sc.probe_result} · 红旗：{flags}
      </div>
      {sc.reason_internal ? <div className="tx-sc-row">内部判断：{sc.reason_internal}</div> : null}
    </details>
  );
}

const gateCss = `
  .ad-gate { max-width: 22rem; margin: 6rem auto; font-family: "Inter", system-ui, sans-serif; color: #111; text-align: center; }
  .ad-gate h1 { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; }
  .ad-gate p { color: #777; font-size: 0.9rem; margin-bottom: 1.5rem; }
  .ad-gate-row { display: flex; gap: 0.5rem; }
  .ad-gate input { flex: 1; border: 1px solid #ddd; border-radius: 0.6rem; padding: 0.55rem 0.8rem; font: inherit; }
  .ad-gate button { background: #111; color: #fff; border: none; border-radius: 0.6rem; padding: 0.55rem 1.1rem; cursor: pointer; }
  .ad-err { color: #b04030; font-size: 0.85rem; margin-top: 1rem; }
`;

const boardCss = `
  .ad-wrap { max-width: 90rem; margin: 0 auto; padding: 2.5rem 1.5rem 4rem;
    font-family: "Inter", -apple-system, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif; color: #111; }
  .ad-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
  .ad-head h1 { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.01em; }
  .ad-refresh { background: #f4f4f1; border: 1px solid #e2e2dd; border-radius: 2rem; padding: 0.4rem 1rem;
    font-size: 0.82rem; cursor: pointer; color: #333; }
  .ad-stat { display: flex; gap: 1.5rem; flex-wrap: wrap; padding: 0.9rem 0; border-top: 1px solid #ededea;
    border-bottom: 1px solid #ededea; font-size: 0.85rem; color: #666; margin-bottom: 1.25rem; }
  .ad-stat b { color: #111; font-size: 1.05rem; font-variant-numeric: tabular-nums; margin-right: 0.2rem; }
  .ad-stat .ok b { color: #1a7f4b; } .ad-stat .warn b { color: #b07820; } .ad-stat .mute b { color: #aaa; }
  .ad-filters { display: flex; gap: 0.7rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .ad-filters select, .ad-filters input { border: 1px solid #e2e2dd; border-radius: 0.6rem; padding: 0.45rem 0.7rem;
    font: inherit; font-size: 0.85rem; background: #fff; }
  .ad-filters input { flex: 1; min-width: 12rem; }
  .ad-table { font-size: 0.85rem; }
  .ad-tr { display: grid; grid-template-columns: 7rem 1.7fr 6.5rem 8rem 5.5rem 3.2rem 7rem 2.2rem 9rem;
    gap: 0.5rem; align-items: center; padding: 0.6rem 0.4rem; border-bottom: 1px solid #f0f0ec; }
  .c-sum { font-size: 0.78rem; color: #555; line-height: 1.45; overflow: hidden;
    display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; cursor: help; }
  .ad-thead .c-sum { color: #999; }
  .ad-thead { color: #999; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em;
    border-bottom: 1px solid #e2e2dd; position: sticky; top: 0; background: #fdfdfc; }
  .c-name { font-weight: 500; display: flex; flex-direction: column; }
  .c-name .uid { font-size: 0.65rem; color: #bbb; font-weight: 400; }
  .c-phone { font-variant-numeric: tabular-nums; color: #444; }
  .c-event { color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pill { padding: 0.12rem 0.5rem; border-radius: 1rem; font-size: 0.72rem; }
  .st-accepted { background: #e3f4ea; color: #1a7f4b; } .st-checked_in { background: #dbeafe; color: #1763b8; }
  .st-waitlisted { background: #fbf0db; color: #b07820; } .st-screening { background: #eee; color: #777; }
  .st-rejected { background: #f3f3f3; color: #aaa; }
  .byhand, .needrev { font-size: 0.62rem; margin-left: 0.25rem; color: #999; border: 1px solid #ddd;
    border-radius: 0.3rem; padding: 0 0.2rem; }
  .needrev { color: #b07820; border-color: #e8d4a8; }
  .c-score .nums { font-variant-numeric: tabular-nums; } .c-score .total { color: #999; margin-left: 0.4rem; font-size: 0.75rem; }
  .c-seat { text-align: center; font-variant-numeric: tabular-nums; color: #444; }
  .c-act { display: flex; gap: 0.3rem; }
  .c-act button { font-size: 0.72rem; border: 1px solid #ddd; border-radius: 0.4rem; padding: 0.2rem 0.45rem;
    background: #fff; cursor: pointer; color: #555; }
  .c-act button:disabled { opacity: 0.35; cursor: default; }
  .c-act .b-ok:hover:not(:disabled) { border-color: #1a7f4b; color: #1a7f4b; }
  .c-act .b-wl:hover:not(:disabled) { border-color: #b07820; color: #b07820; }
  .c-act .b-no:hover:not(:disabled) { border-color: #b04030; color: #b04030; }
  .mute { color: #ccc; }
  .ad-empty { padding: 2rem; text-align: center; color: #aaa; }
  .ad-err { color: #b04030; font-size: 0.82rem; margin: 0.5rem 0; }
  .ad-note { margin-top: 1.5rem; font-size: 0.76rem; color: #aaa; }
  .c-name.clickable { cursor: pointer; }
  .c-name.clickable:hover .nm { text-decoration: underline; }
  .tx-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center;
    justify-content: center; padding: 2rem; z-index: 50; }
  .tx-modal { background: #fff; border-radius: 1rem; width: 100%; max-width: 40rem; max-height: 85vh;
    display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.18); }
  .tx-head { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem;
    border-bottom: 1px solid #ededea; }
  .tx-title b { font-size: 0.98rem; }
  .tx-meta { display: block; font-size: 0.76rem; color: #999; margin-top: 0.15rem; }
  .tx-summary { font-size: 0.8rem; color: #555; margin-top: 0.4rem; line-height: 1.55; max-width: 32rem; }
  .tx-head button { background: #f4f4f1; border: 1px solid #e2e2dd; border-radius: 2rem; padding: 0.35rem 0.9rem;
    font-size: 0.8rem; cursor: pointer; }
  .tx-body { overflow-y: auto; padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .tx-turn { display: flex; flex-direction: column; }
  .tx-turn.user { align-items: flex-end; }
  .tx-turn.assistant { align-items: flex-start; }
  .tx-bubble { max-width: 85%; padding: 0.6rem 0.85rem; border-radius: 0.9rem; font-size: 0.88rem;
    line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .tx-bubble.user { background: #111; color: #fdfdfc; border-bottom-right-radius: 0.25rem; }
  .tx-bubble.assistant { background: #f4f4f1; color: #222; border-bottom-left-radius: 0.25rem; }
  .tx-sc { margin-top: 0.3rem; font-size: 0.74rem; color: #888; max-width: 85%; }
  .tx-sc summary { cursor: pointer; color: #b07820; }
  .tx-sc-row { margin-top: 0.25rem; color: #777; line-height: 1.5; }
`;
