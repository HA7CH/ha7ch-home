// Supabase-backed data layer for the event bot. Server-side only (uses the service-role key,
// bypasses RLS). Mirrors the worker's D1 DAO but channel-agnostic: the engine talks to this
// interface and never knows whether the person came in via web or WeChat.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface EventRow {
  event_id: string;
  name: string;
  status: "draft" | "open" | "closed";
  brief: string;
  address: string;
  time_info: string;
  start_at: number;
  seat_total: number;
  max_turns: number;
  recap_json: string | null;
  created_at: number;
  updated_at: number;
}

export interface UserRow {
  user_id: string;
  channel: "web" | "wechat";
  display_name: string | null;
  phone: string | null;
  active_event_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface ApplicationRow {
  event_id: string;
  user_id: string;
  stage: "screening" | "accepted" | "checked_in" | "waitlisted" | "rejected";
  decision: string | null;
  score_project: number;
  score_scene: number;
  score_resource: number;
  score_thinking: number;
  faction: string | null;
  faction_secondary: string | null;
  confidence: number;
  red_flags: string;
  decision_reason: string | null;
  summary: string | null;
  scorecard_json: string;
  needs_human_review: number;
  human_decided: number;
  today_problem: string | null;
  wants_to_meet: string | null;
  matched_seats: string;
  invite_sent_at: number;
  seat_no: number | null;
  checked_in_at: number;
  check_in_seq: number | null;
  turn_count: number;
  created_at: number;
  decided_at: number;
  updated_at: number;
}

// Flattened application ⋈ user ⋈ event, the shape the engine reads.
export interface Applicant extends ApplicationRow {
  display_name: string | null;
  phone: string | null;
  channel: "web" | "wechat";
  event_name: string;
  event_brief: string;
  event_address: string;
  event_time_info: string;
  event_start_at: number;
  event_seat_total: number;
  event_max_turns: number;
  event_status: EventRow["status"];
}

export interface ScreeningUpdate {
  scores: { project: number; scene: number; resource: number; thinking: number };
  faction: string;
  faction_secondary: string;
  confidence: number;
  red_flags: string[];
  decision: string;
  decision_reason: string;
  summary?: string | null;
  scorecard_json: string;
  needs_human_review: boolean;
  display_name?: string | null;
  phone?: string | null;
  problem?: string | null;
  wants_to_meet?: string | null;
  turn_count: number;
}

const now = () => Date.now();

export class Store {
  constructor(private sb: SupabaseClient) {}

  // 写操作统一查错抛错。supabase-js 出错不 throw、而是 resolve 成 {error}，不查就会静默丢
  // （「对话只记一轮」「被告知通过但库里没改」的根因）。让失败冒泡到上游由其重试/报错。
  private async mustWrite(label: string, builder: PromiseLike<{ error: { message: string } | null }>): Promise<void> {
    const { error } = await builder;
    if (error) throw new Error(`Supabase ${label} 失败：${error.message}`);
  }

  // ── users ────────────────────────────────────────────────────────────────
  async getUser(userId: string): Promise<UserRow | null> {
    const { data, error } = await this.sb.from("event_users").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw new Error(`Supabase 读 event_users 失败：${error.message}`);
    return (data as UserRow) ?? null;
  }

  async ensureUser(userId: string, channel: "web" | "wechat"): Promise<UserRow> {
    const existing = await this.getUser(userId);
    if (existing) return existing;
    const row = { user_id: userId, channel, active_event_id: null, created_at: now(), updated_at: now() };
    const { error } = await this.sb.from("event_users").upsert(row, { onConflict: "user_id", ignoreDuplicates: true });
    if (error) throw new Error(`Supabase 写 event_users 失败：${error.message}`);
    const created = await this.getUser(userId);
    if (!created) throw new Error("event_users 创建后读不到（多半是 Supabase 密钥无效或 RLS 拦截）");
    return created;
  }

  async setActiveEvent(userId: string, eventId: string | null): Promise<void> {
    await this.mustWrite(
      "setActiveEvent",
      this.sb.from("event_users").update({ active_event_id: eventId, updated_at: now() }).eq("user_id", userId),
    );
  }

  async updateProfile(userId: string, patch: { display_name?: string | null; phone?: string | null }): Promise<void> {
    const set: Record<string, unknown> = { updated_at: now() };
    if (patch.display_name != null && patch.display_name !== "") set.display_name = patch.display_name;
    if (patch.phone != null && patch.phone !== "") set.phone = patch.phone;
    await this.mustWrite("updateProfile", this.sb.from("event_users").update(set).eq("user_id", userId));
  }

  // ── events ───────────────────────────────────────────────────────────────
  async getEvent(eventId: string): Promise<EventRow | null> {
    const { data, error } = await this.sb.from("event_events").select("*").eq("event_id", eventId).maybeSingle();
    if (error) throw new Error(`Supabase 读 event_events 失败：${error.message}`);
    return (data as EventRow) ?? null;
  }

  async listOpenEvents(): Promise<EventRow[]> {
    const { data, error } = await this.sb.from("event_events").select("*").eq("status", "open").order("created_at");
    if (error) throw new Error(`Supabase 读 open events 失败：${error.message}`);
    return (data as EventRow[]) ?? [];
  }

  async listEvents(): Promise<EventRow[]> {
    const { data, error } = await this.sb.from("event_events").select("*").order("created_at");
    if (error) throw new Error(`Supabase 读 events 失败：${error.message}`);
    return (data as EventRow[]) ?? [];
  }

  // ── admin (cross-event) ────────────────────────────────────────────────────
  // Every application across every event, flattened with the person's profile + event name.
  async listAllApplications(): Promise<Applicant[]> {
    const [apps, users, events] = await Promise.all([
      this.sb.from("event_applications").select("*").order("updated_at", { ascending: false }),
      this.sb.from("event_users").select("user_id, display_name, phone, channel"),
      this.sb.from("event_events").select("*"),
    ]);
    if (apps.error) throw new Error(`Supabase 读 applications 失败：${apps.error.message}`);
    const userMap = new Map((users.data ?? []).map((u: any) => [u.user_id, u]));
    const eventMap = new Map((events.data ?? []).map((e: any) => [e.event_id, e as EventRow]));
    return ((apps.data as ApplicationRow[]) ?? []).flatMap((app) => {
      const ev = eventMap.get(app.event_id);
      if (!ev) return [];
      const u = userMap.get(app.user_id);
      return [
        {
          ...app,
          display_name: u?.display_name ?? null,
          phone: u?.phone ?? null,
          channel: (u?.channel ?? "web") as "web" | "wechat",
          event_name: ev.name,
          event_brief: ev.brief,
          event_address: ev.address,
          event_time_info: ev.time_info,
          event_start_at: ev.start_at,
          event_seat_total: ev.seat_total,
          event_max_turns: ev.max_turns,
          event_status: ev.status,
        } as Applicant,
      ];
    });
  }

  // Screening rows in OPEN events whose last update is older than beforeMs (epoch ms). Used by the
  // auto-finalizer: the engine is reactive, so someone who went quiet mid-conversation before hitting
  // the MIN_USER_TURNS floor would sit in "正在聊" forever. This surfaces them so they can get a verdict.
  async listStaleScreening(beforeMs: number): Promise<Applicant[]> {
    const [apps, users, events] = await Promise.all([
      this.sb.from("event_applications").select("*").eq("stage", "screening").lt("updated_at", beforeMs),
      this.sb.from("event_users").select("user_id, display_name, phone, channel"),
      this.sb.from("event_events").select("*").eq("status", "open"),
    ]);
    if (apps.error) throw new Error(`Supabase 读 stale screening 失败：${apps.error.message}`);
    const userMap = new Map((users.data ?? []).map((u: any) => [u.user_id, u]));
    const eventMap = new Map((events.data ?? []).map((e: any) => [e.event_id, e as EventRow]));
    return ((apps.data as ApplicationRow[]) ?? []).flatMap((app) => {
      const ev = eventMap.get(app.event_id);
      if (!ev) return []; // 活动非 open（或已不存在）→ 不动
      const u = userMap.get(app.user_id);
      return [
        {
          ...app,
          display_name: u?.display_name ?? null,
          phone: u?.phone ?? null,
          channel: (u?.channel ?? "web") as "web" | "wechat",
          event_name: ev.name,
          event_brief: ev.brief,
          event_address: ev.address,
          event_time_info: ev.time_info,
          event_start_at: ev.start_at,
          event_seat_total: ev.seat_total,
          event_max_turns: ev.max_turns,
          event_status: ev.status,
        } as Applicant,
      ];
    });
  }

  // Full conversation for one person in one event (admin viewer): every turn in order,
  // including the assistant's raw output + scorecard so the operator can see the bot's reasoning.
  async loadFullTranscript(
    eventId: string,
    userId: string,
  ): Promise<{ role: "user" | "assistant"; content: string; raw: string | null; scorecard_json: string | null; created_at: number }[]> {
    const { data, error } = await this.sb
      .from("event_transcripts")
      .select("role, content, raw, scorecard_json, created_at")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .order("id", { ascending: true });
    if (error) throw new Error(`Supabase 读对话失败：${error.message}`);
    return (data as any[]) ?? [];
  }

  // Human override of the bot's decision (the bouncer's final call).
  async patchApplication(
    eventId: string,
    userId: string,
    patch: { stage?: ApplicationRow["stage"]; decision?: string; human_decided?: number },
  ): Promise<void> {
    const { error } = await this.sb
      .from("event_applications")
      .update({ ...patch, updated_at: now() })
      .eq("event_id", eventId)
      .eq("user_id", userId);
    if (error) throw new Error(`Supabase 改判失败：${error.message}`);
  }

  // ── applications ─────────────────────────────────────────────────────────
  async getApplicant(eventId: string, userId: string): Promise<Applicant | null> {
    const { data: app } = await this.sb
      .from("event_applications")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!app) return null;
    const [user, event] = await Promise.all([this.getUser(userId), this.getEvent(eventId)]);
    if (!event) return null;
    return {
      ...(app as ApplicationRow),
      display_name: user?.display_name ?? null,
      phone: user?.phone ?? null,
      channel: user?.channel ?? "web",
      event_name: event.name,
      event_brief: event.brief,
      event_address: event.address,
      event_time_info: event.time_info,
      event_start_at: event.start_at,
      event_seat_total: event.seat_total,
      event_max_turns: event.max_turns,
      event_status: event.status,
    };
  }

  async createApplication(eventId: string, userId: string): Promise<void> {
    const row = { event_id: eventId, user_id: userId, stage: "screening", created_at: now(), updated_at: now() };
    await this.mustWrite(
      "createApplication",
      this.sb.from("event_applications").upsert(row, { onConflict: "event_id,user_id", ignoreDuplicates: true }),
    );
  }

  async setStage(eventId: string, userId: string, stage: ApplicationRow["stage"]): Promise<void> {
    await this.mustWrite(
      "setStage",
      this.sb.from("event_applications").update({ stage, updated_at: now() }).eq("event_id", eventId).eq("user_id", userId),
    );
  }

  async setTurn(eventId: string, userId: string, n: number): Promise<void> {
    await this.mustWrite(
      "setTurn",
      this.sb.from("event_applications").update({ turn_count: n, updated_at: now() }).eq("event_id", eventId).eq("user_id", userId),
    );
  }

  async updateScreeningResult(eventId: string, userId: string, u: ScreeningUpdate): Promise<void> {
    await this.mustWrite(
      "updateScreeningResult",
      this.sb
        .from("event_applications")
        .update({
          score_project: u.scores.project,
          score_scene: u.scores.scene,
          score_resource: u.scores.resource,
          score_thinking: u.scores.thinking,
          faction: u.faction,
          faction_secondary: u.faction_secondary,
          confidence: u.confidence,
          red_flags: JSON.stringify(u.red_flags),
          decision: u.decision,
          decision_reason: u.decision_reason,
          summary: u.summary ?? null,
          scorecard_json: u.scorecard_json,
          needs_human_review: u.needs_human_review ? 1 : 0,
          today_problem: u.problem ?? null,
          wants_to_meet: u.wants_to_meet ?? null,
          turn_count: u.turn_count,
          decided_at: now(),
          updated_at: now(),
        })
        .eq("event_id", eventId)
        .eq("user_id", userId),
    );
    await this.updateProfile(userId, { display_name: u.display_name ?? undefined, phone: u.phone ?? undefined });
  }

  // Allocate the next per-event seat. Read-then-write (fine for the web tester / low concurrency;
  // the WeChat worker path will use an atomic RPC). Idempotent: returns the existing seat if set.
  async claimSeat(eventId: string, userId: string): Promise<number> {
    const cur = await this.getApplicant(eventId, userId);
    if (cur?.seat_no != null) return cur.seat_no;
    const { data: rows } = await this.sb
      .from("event_applications")
      .select("seat_no")
      .eq("event_id", eventId)
      .not("seat_no", "is", null)
      .order("seat_no", { ascending: false })
      .limit(1);
    const next = ((rows?.[0]?.seat_no as number) ?? 0) + 1;
    await this.mustWrite(
      "claimSeat",
      this.sb
        .from("event_applications")
        .update({ seat_no: next, invite_sent_at: now(), updated_at: now() })
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .is("seat_no", null),
    );
    const after = await this.getApplicant(eventId, userId);
    return after?.seat_no ?? next;
  }

  // ── transcripts ──────────────────────────────────────────────────────────
  async appendTranscript(
    eventId: string,
    userId: string,
    role: "user" | "assistant",
    content: string,
    opts?: { raw?: string; scorecardJson?: string },
  ): Promise<void> {
    await this.mustWrite(
      "appendTranscript",
      this.sb.from("event_transcripts").insert({
        event_id: eventId,
        user_id: userId,
        role,
        content,
        raw: opts?.raw ?? null,
        scorecard_json: opts?.scorecardJson ?? null,
        created_at: now(),
      }),
    );
  }

  // Latest `limit` turns in chronological order. Assistant rows return their RAW output (incl. the
  // SCORECARD block) so the model sees its own prior format and doesn't degrade (proven fix).
  async loadTranscript(
    eventId: string,
    userId: string,
    limit = 20,
  ): Promise<{ role: "user" | "assistant"; content: string }[]> {
    const { data, error } = await this.sb
      .from("event_transcripts")
      .select("role, content, raw")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Supabase 读对话历史失败：${error.message}`);
    const rows = (data as { role: "user" | "assistant"; content: string; raw: string | null }[]) ?? [];
    return rows
      .reverse()
      .map((r) => ({ role: r.role, content: r.role === "assistant" && r.raw ? r.raw : r.content }));
  }
}

export function createStore(): Store {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || key === "PASTE_SERVICE_ROLE_KEY_HERE") {
    throw new Error("Supabase 未配置：在 .env.local 填好 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY");
  }
  return new Store(createClient(url, key, { auth: { persistSession: false } }));
}
