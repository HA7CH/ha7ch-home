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
  postDecisionSystem,
} from "./llm";
import { type Store, type Applicant, type UserRow } from "./store";

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
// 一句寒暄/否定/疑问/口语短句别误当成名字（「好的」「提高了」这类把真名覆盖掉过）。
const NAME_STOP =
  /(你好|您好|哈喽|在吗|谢谢|多谢|没有|不是|可以|不行|什么|怎么|知道|这个|那个|一下|为啥|凭啥|好的|好了|好嘞|收到|明白|了解|是的|对的|嗯嗯|哈哈|稍等|马上|提高|增加|降低|减少)/;

// confident=true：「我叫X」这类显式自报，高置信，可覆盖旧名。
// confident=false：裸名猜测（如「王磊 138...」里剥出的两字），低置信，只在还没有名字时才用。
function extractName(text: string): { name: string; confident: boolean } | undefined {
  for (const re of NAME_PATTERNS) {
    const m = text.match(re);
    if (m?.[1]) return { name: m[1].trim(), confident: true };
  }
  // 「王磊 13800138000」这种：去掉手机号和分隔符，剩下若是 2-4 个中文就当名字（低置信）。
  const stripped = text.replace(PHONE_RE, "").replace(/[，,。.、\s]+/g, "");
  if (BARE_NAME_RE.test(stripped) && !NAME_STOP.test(stripped)) return { name: stripped, confident: false };
  return undefined;
}

// 返回本轮是否抓到新的手机号/称呼。裸名猜测绝不覆盖已有真名（防「好的」覆盖「李贤培」）。
async function captureProfile(store: Store, user: UserRow, text: string): Promise<boolean> {
  const phone = text.match(PHONE_RE)?.[1];
  const ex = extractName(text);
  const name = ex && (ex.confident || !user.display_name) ? ex.name : undefined;
  if (phone || name) {
    await store.updateProfile(user.user_id, { display_name: name, phone });
    return true;
  }
  return false;
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
  // 任何一轮的手机号/称呼都先抓进 profile（含定稿后才补来的），不分阶段。
  await captureProfile(store, user, text);

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
    // 不在这里预建 application：没真正开聊的人不入库。等他答了开场问题，handleTurn 的 lazy-create 再建。
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
  // 同上：不预建 application，等第一条真实回答时由 handleTurn 惰性创建，没开聊的人不入库。
  return [reply || `好，「${ev.name}」这场。`, OPENING_QUESTION];
}

async function routeByStage(
  store: Store,
  llm: LLMConfig,
  a: Applicant,
  text: string,
): Promise<string[]> {
  switch (a.stage) {
    case "screening":
      return handleScreening(store, llm, a, text);
    case "accepted":
    case "checked_in":
      return handleAssistant(store, llm, a, text);
    case "waitlisted":
    case "rejected":
      // 已定候补/婉拒但对方还在说：继续倾听 + 静默复评，绝不再机械重复硬话术。
      return handlePostDecision(store, llm, a, text);
    default:
      return handleScreening(store, llm, a, text);
  }
}

// 触顶轮的收尾语：不再追问，但也别摔门。明确告诉对方还能继续补充，下一条仍会被好好接住（handlePostDecision）。
const SCREENING_CLOSER =
  "你说的我都记下了，我去和主办对一下，有结果第一时间找你。要是还有想补充的，随时发我，我都看着。";

// 定稿后对方还能再自然接多少轮倾听，超过才回落到温和的 hold 一句。额度不是瓶颈，给得宽一些。
const POST_DECISION_LISTEN_CAP = 8;

async function handleScreening(store: Store, llm: LLMConfig, a: Applicant, text: string): Promise<string[]> {
  // 至少要给到能走满最小来回数的空间，避免某活动配了过小的 max_turns 和下限冲突成死区。
  const maxTurns = Math.max(a.event_max_turns > 0 ? a.event_max_turns : 8, MIN_USER_TURNS + 1);
  await store.appendTranscript(a.event_id, a.user_id, "user", text);
  // 触顶轮：这一轮必须给最终裁定并收尾，不再继续追问；但仍跑一次评分，绝不把人留在 screening 死角。
  const atCap = a.turn_count >= maxTurns;

  const history = await store.loadTranscript(a.event_id, a.user_id, 20);
  const sys = screeningSystem({ eventName: a.event_name, brief: a.event_brief, seatTotal: a.event_seat_total });
  // max_tokens 给足，防止「长回复 + scorecard」把结尾的评分块截断 → 解析不到 → 漏打分。
  const raw = await llmCall(llm, sys, history, 1536);
  const { reply, scorecard } = parseScreening(raw);
  // 触顶轮发固定收尾，否则发 LLM 的回复。两种情况都保留这一轮解析到的 scorecard。
  const replyText = atCap ? SCREENING_CLOSER : reply || "嗯，继续说说。";
  await store.appendTranscript(a.event_id, a.user_id, "assistant", replyText, {
    raw: atCap ? undefined : raw,
    scorecardJson: scorecard ? JSON.stringify(scorecard) : undefined,
  });

  const out: string[] = [replyText];

  if (!scorecard) {
    // 触顶却没解析到 scorecard：不能留 screening 死角，沿用已知分数/信息，强制候补 + 人工复核。
    if (atCap) {
      await store.updateScreeningResult(a.event_id, a.user_id, {
        scores: {
          project: a.score_project,
          scene: a.score_scene,
          resource: a.score_resource,
          thinking: a.score_thinking,
        },
        faction: a.faction ?? "unknown",
        faction_secondary: a.faction_secondary ?? "none",
        confidence: a.confidence,
        red_flags: [],
        decision: "waitlist",
        decision_reason: a.decision_reason || "聊满轮次上限仍未产出评分，转候补交人工复核。",
        summary: a.summary,
        scorecard_json: a.scorecard_json || "",
        needs_human_review: true,
        display_name: a.display_name,
        phone: a.phone,
        problem: a.today_problem,
        wants_to_meet: a.wants_to_meet,
        turn_count: a.turn_count + 1,
      });
      await store.setStage(a.event_id, a.user_id, "waitlisted");
      return out;
    }
    await store.setTurn(a.event_id, a.user_id, a.turn_count + 1);
    return out;
  }

  const d = deriveDecision(scorecard);
  const userTurns = a.turn_count + 1; // 含本轮
  // 硬红旗（小白/卖课/投资人）可以早判，免得在明显不合适的人身上耗满轮次；其余决策必须等满最小来回数。
  const HARD_FLAGS = ["newbie", "course_seller", "investor"];
  const hardReject = d.decision === "reject" && scorecard.red_flags.some((f) => HARD_FLAGS.includes(f));
  // 触顶轮一律视为到达下限并定稿（不再追问、不再开口要号）。
  const reachedFloor = userTurns >= MIN_USER_TURNS || hardReject || atCap;
  // 联系方式闸：该 accept、但还没拿到「手机号 + 称呼」任一项 → 先开口要，stage 留在 screening，绝不在缺联系方式时通过。触顶时不再追要。
  const knownPhone = scorecard.phone ?? a.phone;
  const knownName = scorecard.display_name ?? a.display_name;
  const needContact = !atCap && reachedFloor && d.decision === "accept" && (!knownPhone || !knownName);
  const finalizing = reachedFloor && !needContact;

  // 触顶定稿：达 accept 但仍无手机号、或规则仍 pending → 落候补 + 人工复核，绝不丢、绝不无号自动通过。
  let finalDecision = d.decision;
  let finalReview = d.needsHumanReview;
  if (atCap && finalizing) {
    if (finalDecision === "accept" && (!knownPhone || !knownName)) {
      finalDecision = "waitlist";
      finalReview = true;
    } else if (finalDecision === "pending") {
      finalDecision = "waitlist";
      finalReview = true;
    }
  }

  await store.updateScreeningResult(a.event_id, a.user_id, {
    scores: scorecard.scores,
    faction: scorecard.faction_primary,
    faction_secondary: scorecard.faction_secondary,
    confidence: scorecard.confidence,
    red_flags: scorecard.red_flags,
    // 没到下限 / 还在要号：先挂 pending，别让后台看到早熟结论。
    decision: finalizing ? finalDecision : "pending",
    decision_reason: scorecard.reason_internal,
    summary: scorecard.summary,
    scorecard_json: JSON.stringify(scorecard),
    needs_human_review: finalizing ? finalReview : false,
    display_name: scorecard.display_name,
    phone: scorecard.phone,
    problem: scorecard.problem,
    wants_to_meet: scorecard.wants_to_meet,
    turn_count: userTurns,
  });

  if (needContact) {
    const ask = !knownPhone && !knownName
      ? "聊得挺好。报个称呼，再留个手机号给我，方便后面统一通知你时间地点。"
      : !knownPhone
        ? "聊得挺好。留个手机号给我吧，方便后面统一通知你时间地点。"
        : "对了，还没请教怎么称呼你？报个称呼，方便后面统一通知你时间地点。";
    await store.appendTranscript(a.event_id, a.user_id, "assistant", ask);
    out.push(ask);
    return out;
  }

  // 没到最小来回数：无论 LLM/规则想不想定稿，都继续留在 screening 追问。
  if (!finalizing) return out;

  if (finalDecision === "accept") {
    await store.claimSeat(a.event_id, a.user_id);
    await store.setStage(a.event_id, a.user_id, "accepted");
    // 不再硬塞一条收尾：LLM 这一轮的回复已经是收尾（prompt 约束了口径），硬塞会变成连发两条、且那条不入库。
  } else if (finalDecision === "waitlist") {
    await store.setStage(a.event_id, a.user_id, "waitlisted");
  } else if (finalDecision === "reject") {
    await store.setStage(a.event_id, a.user_id, "rejected");
  }
  return out;
}

// 解析 red_flags（库里以 JSON 字符串存）。
function parseRedFlags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// 定稿后对方还在发实质内容：继续倾听 + 静默复评。绝不再机械重复硬话术、绝不再质问。
// 新内容照常计入 scorecard；过线且已有手机号+称呼 → 自动抬进通过并占座（不区分原来是人工还是自动定的）。
// 只升不降：维持或抬高，绝不因这些补充内容把人往下压。
async function handlePostDecision(store: Store, llm: LLMConfig, a: Applicant, text: string): Promise<string[]> {
  await store.appendTranscript(a.event_id, a.user_id, "user", text);

  // 硬红旗婉拒（小白/卖课/投资人）不再深聊也不复评：温和 hold 一句，不盘问、也不赶人。
  const flags = parseRedFlags(a.red_flags);
  const HARD_FLAGS = ["newbie", "course_seller", "investor"];
  const hardRejected = a.stage === "rejected" && flags.some((f) => HARD_FLAGS.includes(f));
  // 定稿后已经倾听很多轮：在筛选轮次上限之上再放宽 POST_DECISION_LISTEN_CAP 轮，超过才回落到温和 hold。
  const baseCap = Math.max(a.event_max_turns > 0 ? a.event_max_turns : 8, MIN_USER_TURNS + 1);
  const overListened = a.turn_count >= baseCap + POST_DECISION_LISTEN_CAP;

  if (hardRejected || overListened) {
    const line = rejectedGreeting();
    await store.appendTranscript(a.event_id, a.user_id, "assistant", line);
    return [line];
  }

  // 继续倾听：post-decision 专用 prompt（只认可、不追问、不许诺），但仍把全程重新打分。
  const history = await store.loadTranscript(a.event_id, a.user_id, 24);
  const sys = postDecisionSystem({ eventName: a.event_name, brief: a.event_brief, seatTotal: a.event_seat_total });
  const raw = await llmCall(llm, sys, history, 1536);
  const { reply, scorecard } = parseScreening(raw);
  const replyText = reply || "嗯，我在听，你接着说。";
  await store.appendTranscript(a.event_id, a.user_id, "assistant", replyText, {
    raw,
    scorecardJson: scorecard ? JSON.stringify(scorecard) : undefined,
  });

  // 解析不到 scorecard：只留痕、推进轮次，不动判定。
  if (!scorecard) {
    await store.setTurn(a.event_id, a.user_id, a.turn_count + 1);
    return [replyText];
  }

  // 复评：分数/小结照常刷新并标人工复核；新信号过线且有联系方式 → 自动抬进通过并占座。
  const d = deriveDecision(scorecard);
  const knownPhone = scorecard.phone ?? a.phone;
  const knownName = scorecard.display_name ?? a.display_name;
  const upgradeToAccept = d.decision === "accept" && !!knownPhone && !!knownName && a.stage !== "accepted";

  await store.updateScreeningResult(a.event_id, a.user_id, {
    scores: scorecard.scores,
    faction: scorecard.faction_primary,
    faction_secondary: scorecard.faction_secondary,
    confidence: scorecard.confidence,
    red_flags: scorecard.red_flags,
    // 定稿后只升不降：过线才抬成 accept，否则维持原判定。
    decision: upgradeToAccept ? "accept" : (a.decision ?? "waitlist"),
    decision_reason: scorecard.reason_internal,
    summary: scorecard.summary,
    scorecard_json: JSON.stringify(scorecard),
    needs_human_review: true,
    display_name: scorecard.display_name,
    phone: scorecard.phone,
    problem: scorecard.problem,
    wants_to_meet: scorecard.wants_to_meet,
    turn_count: a.turn_count + 1,
  });

  if (upgradeToAccept) {
    await store.claimSeat(a.event_id, a.user_id);
    await store.setStage(a.event_id, a.user_id, "accepted");
  }
  return [replyText];
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
