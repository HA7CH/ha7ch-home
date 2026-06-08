// Channel-agnostic conversation engine. handleTurn() takes a person's message and returns the
// bot's reply lines. The web chat renders them; the (future) WeChat bridge sends each via iLink.
// All the routing/screening/decision logic lives here, identical across channels.

import {
  screeningSystem,
  pickerSystem,
  parsePick,
  parseScreening,
  callLLM,
  deriveDecision,
  rejectedGreeting,
  assistantSystem,
} from "./llm";
import { type Store, type Applicant } from "./store";

export interface LLMConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

const NON_TEXT = "发条文字消息就行，我这边看不了图片或语音。";
const NO_OPEN = "现在没有开放报名的活动。开了我再陪你聊，先别急。";
const OPENING_QUESTION =
  "好。先聊聊你最近在做的最真的一件事吧，在做什么、做到哪一步了、卡在哪。";
// finalize 任何决策前至少要有这么多个用户来回，防止 2 轮就下结论（硬红旗除外，可早判）。
const MIN_USER_TURNS = 5;

// 「换一场活动」的关键词快路径（要带活动/场/局上下文，避免把「换个说法」误判成换活动）。
function wantsSwitch(text: string): boolean {
  return /(换|改|报)\s*(个|一个|别的|其他|另)?\s*(活动|场|局)|重新选(活动|场|局)?|换一场|报别的/.test(text);
}

// 任何一轮里出现的手机号/自我介绍都抓进 profile（不分阶段，防止通过后才报联系方式而漏记）。
const PHONE_RE = /(?<!\d)(1[3-9]\d{9})(?!\d)/;
// 多句式姓名：我叫/我是/叫我/就叫/名字叫/这边是/本人 + 2-4 个中文 或 英文名。
const NAME_PATTERNS: RegExp[] = [
  /(?:我(?:就)?叫(?:做)?|我是|叫我|就叫我?|名字(?:是|叫)|这边是|本人)\s*([一-龥]{2,4}|[A-Za-z][A-Za-z .]{1,15})/,
];
const BARE_NAME_RE = /^[一-龥]{2,4}$/;
// 一句寒暄/否定/疑问短句别误当成名字。
const NAME_STOP = /(你好|您好|哈喽|在吗|谢谢|没有|不是|可以|不行|什么|怎么|知道|这个|那个|一下|为啥|凭啥)/;

function extractName(text: string): string | undefined {
  for (const re of NAME_PATTERNS) {
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  // 「王磊 13800138000」这种：去掉手机号和分隔符，剩下若是 2-4 个中文就当名字。
  const stripped = text.replace(PHONE_RE, "").replace(/[，,。.、\s]+/g, "");
  if (BARE_NAME_RE.test(stripped) && !NAME_STOP.test(stripped)) return stripped;
  return undefined;
}

async function captureProfile(store: Store, userId: string, text: string): Promise<void> {
  const phone = text.match(PHONE_RE)?.[1];
  const name = extractName(text);
  if (phone || name) await store.updateProfile(userId, { display_name: name, phone });
}

function llmCall(
  llm: LLMConfig,
  system: string,
  history: { role: "user" | "assistant"; content: string }[],
  maxTokens = 1024,
): Promise<string> {
  return callLLM(llm.apiKey, llm.model, system, history, { baseUrl: llm.baseUrl, maxTokens });
}

export async function handleTurn(
  store: Store,
  llm: LLMConfig,
  userId: string,
  channel: "web" | "wechat",
  text: string,
): Promise<string[]> {
  const user = await store.ensureUser(userId, channel);
  if (!text || !text.trim()) return [NON_TEXT];
  await captureProfile(store, userId, text);

  if (user.active_event_id == null) return runPicker(store, llm, userId, text);
  if (wantsSwitch(text)) {
    await store.setActiveEvent(userId, null);
    return runPicker(store, llm, userId, text);
  }

  const event = await store.getEvent(user.active_event_id);
  let a = event ? await store.getApplicant(event.event_id, userId) : null;
  // active event vanished/closed and no prior application → back to picker
  if (!event || (!a && event.status !== "open")) {
    await store.setActiveEvent(userId, null);
    return runPicker(store, llm, userId, text);
  }
  if (!a) {
    await store.createApplication(event.event_id, userId);
    a = await store.getApplicant(event.event_id, userId);
  }
  if (!a) return [];
  return routeByStage(store, llm, a, text);
}

async function runPicker(store: Store, llm: LLMConfig, userId: string, text: string): Promise<string[]> {
  const open = await store.listOpenEvents();
  if (open.length === 0) return [NO_OPEN];

  if (open.length === 1) {
    const ev = open[0];
    await store.setActiveEvent(userId, ev.event_id);
    const existing = await store.getApplicant(ev.event_id, userId);
    if (existing) return routeByStage(store, llm, existing, text);
    await store.createApplication(ev.event_id, userId);
    return [`现在开放的就是「${ev.name}」，我们就按这场聊。`, OPENING_QUESTION];
  }

  // ≥2 open events: let the LLM map free text → an event_id, then server-validate it's in the open set.
  const sys = pickerSystem(open.map((e) => ({ event_id: e.event_id, name: e.name, time_info: e.time_info })));
  const raw = await llmCall(llm, sys, [{ role: "user", content: text }], 400);
  const { reply, pick } = parsePick(raw);
  const valid = pick?.event_id && open.some((e) => e.event_id === pick.event_id) ? pick.event_id : null;
  if (!valid) {
    const list = open.map((e) => `· ${e.name}`).join("\n");
    return [reply || `现在开放这几场，你想报哪个？\n${list}`];
  }
  const ev = open.find((e) => e.event_id === valid)!;
  await store.setActiveEvent(userId, valid);
  const existing = await store.getApplicant(valid, userId);
  if (existing) return routeByStage(store, llm, existing, text);
  await store.createApplication(valid, userId);
  return [reply || `好，「${ev.name}」这场。`, OPENING_QUESTION];
}

async function routeByStage(store: Store, llm: LLMConfig, a: Applicant, text: string): Promise<string[]> {
  switch (a.stage) {
    case "screening":
      return handleScreening(store, llm, a, text);
    case "accepted":
    case "checked_in":
      return handleAssistant(store, llm, a, text);
    case "waitlisted":
    case "rejected":
      return [rejectedGreeting()];
    default:
      return handleScreening(store, llm, a, text);
  }
}

async function handleScreening(store: Store, llm: LLMConfig, a: Applicant, text: string): Promise<string[]> {
  // 至少要给到能走满最小来回数的空间，避免某活动配了过小的 max_turns 和下限冲突成死区。
  const maxTurns = Math.max(a.event_max_turns > 0 ? a.event_max_turns : 8, MIN_USER_TURNS + 1);
  await store.appendTranscript(a.event_id, a.user_id, "user", text);

  if (a.turn_count >= maxTurns) {
    const closer =
      "今天先聊到这。你说的我都记下了，我去和主办对一下，有结果我主动找你。先回去把那件事再往前推推。";
    await store.appendTranscript(a.event_id, a.user_id, "assistant", closer);
    return [closer];
  }

  const history = await store.loadTranscript(a.event_id, a.user_id, 20);
  const sys = screeningSystem({ eventName: a.event_name, brief: a.event_brief, seatTotal: a.event_seat_total });
  const raw = await llmCall(llm, sys, history, 1024);
  const { reply, scorecard } = parseScreening(raw);
  const replyText = reply || "嗯，继续说说。";
  await store.appendTranscript(a.event_id, a.user_id, "assistant", replyText, {
    raw,
    scorecardJson: scorecard ? JSON.stringify(scorecard) : undefined,
  });

  const out: string[] = [replyText];

  if (!scorecard) {
    await store.setTurn(a.event_id, a.user_id, a.turn_count + 1);
    return out;
  }

  const d = deriveDecision(scorecard);
  const userTurns = a.turn_count + 1; // 含本轮
  // 硬红旗（小白/卖课/投资人）可以早判，免得在明显不合适的人身上耗满轮次；其余决策必须等满最小来回数。
  const HARD_FLAGS = ["newbie", "course_seller", "investor"];
  const hardReject = d.decision === "reject" && scorecard.red_flags.some((f) => HARD_FLAGS.includes(f));
  const reachedFloor = userTurns >= MIN_USER_TURNS || hardReject;
  // 联系方式闸：该 accept、但还没拿到手机号 → 先开口要，stage 留在 screening，绝不在没号时通过。
  const knownPhone = scorecard.phone ?? a.phone;
  const needContact = reachedFloor && d.decision === "accept" && !knownPhone;
  const finalizing = reachedFloor && !needContact;

  await store.updateScreeningResult(a.event_id, a.user_id, {
    scores: scorecard.scores,
    faction: scorecard.faction_primary,
    faction_secondary: scorecard.faction_secondary,
    confidence: scorecard.confidence,
    red_flags: scorecard.red_flags,
    // 没到下限 / 还在要号：先挂 pending，别让后台看到早熟结论。
    decision: finalizing ? d.decision : "pending",
    decision_reason: scorecard.reason_internal,
    summary: scorecard.summary,
    scorecard_json: JSON.stringify(scorecard),
    needs_human_review: finalizing ? d.needsHumanReview : false,
    display_name: scorecard.display_name,
    phone: scorecard.phone,
    problem: scorecard.problem,
    wants_to_meet: scorecard.wants_to_meet,
    turn_count: userTurns,
  });

  if (needContact) {
    const knownName = scorecard.display_name ?? a.display_name;
    const ask = knownName
      ? "聊得挺好。留个手机号给我吧，方便后面统一通知你时间地点。"
      : "聊得挺好。报个称呼，再留个手机号给我，方便后面统一通知你时间地点。";
    await store.appendTranscript(a.event_id, a.user_id, "assistant", ask);
    out.push(ask);
    return out;
  }

  // 没到最小来回数：无论 LLM/规则想不想定稿，都继续留在 screening 追问。
  if (!finalizing) return out;

  if (d.decision === "accept") {
    await store.claimSeat(a.event_id, a.user_id);
    await store.setStage(a.event_id, a.user_id, "accepted");
    out.push(
      "聊明白了，你的情况我都记下了。这场名额有限，最后一批确认我们会统一发出，合适的话第一时间联系你，地址和时间到时一起给你。",
    );
  } else if (d.decision === "waitlist") {
    await store.setStage(a.event_id, a.user_id, "waitlisted");
  } else if (d.decision === "reject") {
    await store.setStage(a.event_id, a.user_id, "rejected");
  }
  return out;
}

async function handleAssistant(store: Store, llm: LLMConfig, a: Applicant, text: string): Promise<string[]> {
  await store.appendTranscript(a.event_id, a.user_id, "user", text);
  const sys = assistantSystem({
    eventName: a.event_name,
    displayName: a.display_name ?? "你",
    seatNo: a.seat_no ?? 0,
  });
  const history = await store.loadTranscript(a.event_id, a.user_id, 12);
  const raw = await llmCall(llm, sys, history, 600);
  const replyText = raw.trim() || "我在。";
  await store.appendTranscript(a.event_id, a.user_id, "assistant", replyText);
  return [replyText];
}
