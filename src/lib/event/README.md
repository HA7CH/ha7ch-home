# HA7CH 活动报名 / 筛选 Bot 架构说明

> 一句话定位：用户在微信里「说服 bot」才能拿到入场资格。微信 I/O 由一个常驻 edge Worker（event.ha7ch.com）承接，对话大脑（选活动 / 筛选 / 打分 / 定稿）跑在 ha7ch-home 的 Next.js + Supabase 引擎里，两条渠道（微信、网页测试）共用同一套引擎、同一份数据、同一个主办后台。

> 本文以实地代码为准（最后核对 2026-06-09）。ha7ch-event 仓库内的 `README.md` 是过时版本（仍描述 Claude 本地处理与邀请函图片流程），与当前 bridge 架构不符，勿参考。

---

## 1. 系统全景

整套系统由两个 git 仓库、两套运行时拼成。微信侧是「哑网关」，所有判断逻辑都在 home 侧。

```
                            微信用户
                               │  发文字消息
                               ▼
                   ┌──────────────────────────┐
                   │  iLink（逆向微信协议）       │  ilinkai.weixin.qq.com
                   │  bot_token / context_token │
                   └──────────────────────────┘
                          ▲           │ getUpdates 长轮询(25s)
              sendmessage │           ▼
        ┌───────────────────────────────────────────────┐
        │  ha7ch-event  (Cloudflare Worker, event.ha7ch.com)│
        │  ─ 纯 iLink I/O 网关 + session 状态机              │
        │  ─ cron 每分钟 runConversationTick               │
        │  ─ D1(SQLite)：bot_token / context_token / 锁     │
        └───────────────────────────────────────────────┘
                               │  POST {userId,text,channel:"wechat",secret}
                               ▼
        ┌───────────────────────────────────────────────┐
        │  ha7ch-home  (Next.js on Vercel, www.ha7ch.com)  │
        │  POST /api/event/chat  ← 引擎入口 handleTurn()    │
        │  ─ picker / screening / postDecision / assistant │
        │  ─ deriveDecision 三道闸  ─ <<<SCORECARD>>> 解析   │
        └───────────────────────────────────────────────┘
                               │  读写
                               ▼
        ┌───────────────────────────────────────────────┐
        │  Supabase (Postgres)                            │
        │  event_events / event_users /                   │
        │  event_applications / event_transcripts          │
        └───────────────────────────────────────────────┘

        旁路（web 测试入口，不经过微信和 Worker）：
        浏览器 /event/chat ──直连──► POST /api/event/chat (channel="web", 无需鉴权)
        浏览器 /event/admin ─────► GET/POST /api/event/admin (token 门禁)
```

要点：

- 微信报名者和网页测试者最终都落在同一个 `POST /api/event/chat`，区别只在 `channel` 字段和是否要 `secret`。
- 网页旁路存在的意义是：不用真人扫码就能在浏览器里跑通整条引擎逻辑，是开发和回归测试的主入口。
- Worker 本身不做任何业务判断。它存在的唯一硬理由是：iLink 的 session token 必须有一个常驻的、有状态的地方落盘和刷新（见第 3 节）。

---

## 2. 两个仓库的职责边界

| 维度 | ha7ch-event | ha7ch-home |
|---|---|---|
| 角色 | 微信 I/O 网关 + session 状态机 | 对话引擎 + 数据真相源 + 主办后台 |
| 技术栈 | Cloudflare Workers（TypeScript，`nodejs_compat`）+ D1（SQLite）+ KV | Next.js（App Router，Node runtime）+ Supabase（Postgres）+ DeepSeek |
| 部署 | `wrangler deploy`（手动 / CI），cron 每分钟触发 | 合并到 master 即触发 Vercel 自动部署 |
| 域名 | event.ha7ch.com（自定义域名） | www.ha7ch.com |
| 负责什么 | 扫码 onboarding、长轮询拉消息、刷 token、把消息转发给 home、把 home 的回复发回微信、主动外发 | 选活动、筛选对话、LLM 打分、三道闸定稿、占座、人工改判、对话留痕 |
| 不负责什么 | 不跑 LLM、不打分、不存评分真相（旧代码里的本地引擎已是死码） | 不碰 iLink、不持有 bot_token、不感知消息来自微信还是浏览器 |

ha7ch-event 仓库里仍保留了 `handleScreeningTurn` / `runPicker` / `routeByStage` 等本地 LLM 函数，但这些已是**死码**（`src/index.ts` 有明确注释）。当前生产流程 100% 由 `bridgeTurn()` 驱动，转发到 home。

**关键运行时差异**：Worker 是 Cloudflare 边缘上的常驻 webhook + cron，靠 D1 持有跨请求状态；home 是 Vercel 上的无状态 serverless function，靠 Supabase 持有状态。这个差异是第 7 节「要不要合并」的核心约束。

---

## 3. 数据落在哪，为什么这么分

数据被故意切成两份，分别落在 Worker 的 D1 和 home 的 Supabase。

### 落在 Worker D1 的（`ha7ch-event/schema.sql`）

只放「微信通道存活所必需的会话状态」，不放业务真相。

| 表 | 放什么 | 为什么必须在 Worker 侧 |
|---|---|---|
| `users` | `bot_token`、`context_token`、`sync_buf`、`token_dead`、`processing_at`、`active_event_id`、`display_name`、`phone` | 见下方「token 为什么不能搬走」 |
| `pending_subscribers` | 已扫码未激活的用户（等首条消息） | onboarding 中间态，2 小时超时清理 |
| `qr_sessions` | 二维码会话（`session_id`、`qrcode`、`status`） | 前端轮询扫码状态用 |
| `applications` / `transcripts` / `events` | 历史本地引擎残留的镜像表 | 当前 bridge 流程下基本只读 / 不写，真相在 Supabase |
| `sync_state` | 全局 key-value | 跨请求同步 |

### 落在 Supabase 的（`ha7ch-home` 的 `src/lib/event/store.ts`）

业务真相源，跨渠道共享。

| 表 | 放什么 |
|---|---|
| `event_events` | 活动定义：`status`(draft/open/closed)、`brief`(注入 prompt)、`address`(仅对通过者透露)、`seat_total`、`max_turns` |
| `event_users` | 用户档案：`channel`(web/wechat)、`display_name`、`phone`、`active_event_id` |
| `event_applications` | 报名状态（主键 `event_id+user_id`）：`stage`、`decision`、四维分、`faction`、`red_flags`、`scorecard_json`、`needs_human_review`、`human_decided`、`seat_no`、`turn_count`、`decided_at` |
| `event_transcripts` | 逐句对话：`role`、`content`、`raw`(含 `<<<SCORECARD>>>` 块)、`scorecard_json` |

### 为什么 iLink 的 session token 必须留在 Worker 侧

这是整套分仓架构的根本原因，不是偷懒：

1. **token 是有状态、会过期、必须就地刷新的**。`bot_token` 是每个微信用户专属的密钥（扫码时 iLink 下发，不可共享）；`context_token` 是会话上下文游标，iLink 的**每条入站消息都可能返回新值，必须立刻刷回 D1**，发送时用最新值，过期就报 `errcode -14`（session expired），用户得重新扫码。
2. **`sync_buf` 是长轮询游标**，决定从哪条消息开始拉，不持久化就会重复拉或丢消息。
3. **`processing_at` 是分布式锁**。cron 每分钟可能有多个实例并发扫到同一用户，`claimUser()` 用这个字段保证一次只有一个实例处理一个用户。
4. **Worker 是常驻有状态环境，Vercel serverless 不是**。这些 token 需要一个能跨请求、跨 cron tick 持久存活并被并发安全更新的地方。把它们搬到 home 侧意味着要么也接一个数据库（就是把 D1 换成 Supabase，见第 7 节代价分析），要么放弃常驻 cron 长轮询模型。

简言之：D1 存「怎么跟微信说话」，Supabase 存「这个人够不够格、聊到哪了」。两者按 `user_id` 关联，微信侧 `user_id` 形如 `o9cq...@im.wechat`，D1 内部去掉 `@im.wechat` 后缀存储，跨到 Supabase 时再补回后缀。

---

## 4. 一次完整对话的数据流时序

### 4.1 微信入站到出站（主链路）

```
1. 用户在微信发一句话
2. cron(每分钟) → runConversationTick
3. listActiveUsers() 取所有 token_dead=0 的用户
4. handleConversation() 并发处理 → claimUser() 抢锁（processing_at）
5. getUpdates(bot_token, sync_buf) 向 iLink 长轮询(25s)，拿到 message_type=1 的用户消息
6. refreshToken()：把消息里的新 context_token 刷回 D1，清 token_dead
7. bridgeTurn()：POST https://www.ha7ch.com/api/event/chat
        body = { userId, text, channel:"wechat", secret:EVENT_BRIDGE_SECRET }
        ─────────────────────── 跨仓库边界 ───────────────────────
8. home /api/event/chat 校验 secret==EVENT_BRIDGE_SECRET，不符返回 401
9. handleTurn(store, llm, userId, "wechat", text)：
     a. ensureUser → 选活动 runPicker（无 active_event_id 时）
     b. routeByStage 按 stage 分发到 handleScreening / handlePostDecision / handleAssistant
     c. handleScreening：记消息 → 取最近 20 轮 → 调 LLM(screeningSystem) → 解析回复 + SCORECARD
        → deriveDecision 三道闸重算 → 联系方式闸 → 终态转移（accept 则 claimSeat 占座）
     d. 所有回复写入 event_transcripts（带 raw 和 scorecard_json）
10. home 返回 { replies: string[] }
        ─────────────────────── 跨仓库边界 ───────────────────────
11. Worker 逐条 sendTextMessage(bot_token, user_id, context_token, replyText) → iLink
12. updateUserSyncBuf()（刷游标）/ markTokenDead()（发送遇 -14 时标死）→ releaseUser() 解锁
```

回复是字符串数组，可能多条（例如首次进活动会返回 `[活动介绍, OPENING_QUESTION]`）。整条链路的端到端延迟约 1 分钟，受 cron 最小间隔（Cloudflare 限制就是 1 分钟）支配。

### 4.2 网页测试旁路

浏览器 `/event/chat` 直接 `POST /api/event/chat`，`channel="web"`，**不需要 secret**（默认 web，开放）。同一个 `handleTurn`，同一份 Supabase。完全绕开 iLink 和 Worker。

### 4.3 主动外发（主办给某人推消息）

```
POST event.ha7ch.com/admin/send { token, user_id, text, event_id? }
  1. 校验 token == ADMIN_TOKEN
  2. 查 D1 users 取 bot_token + context_token（去 @im.wechat 后缀）
  3. token_dead=1 → 返回 409，提示需重扫码
  4. sendTextMessage(bot_token, user_id, context_token, text) → iLink
  5. 发成功后，若配了 SUPABASE_URL+SERVICE_ROLE_KEY，直接 POST Supabase REST
        写一行 event_transcripts：role="assistant", raw="admin-send"
        ← 这是 Worker 唯一一次直接写 Supabase，只为留痕，失败不影响已发出的消息
```

这条链路解决的是「主办直发不留痕、Supabase 对话记录出入」的问题：通过（accept）时引擎只占座不发地址，地址等统一通知靠主办后续通过这条 `/admin/send` 群发。

---

## 5. 环境变量 / 密钥清单

> 只列变量名，实际值在各自的 `.env.local` / `wrangler secret`，绝不入库。

### ha7ch-home（`.env.local`，不提交 git）

| 变量 | 用途 |
|---|---|
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端绕 RLS 密钥（高敏，绝不下发浏览器） |
| `DEEPSEEK_API_KEY` | DeepSeek LLM 密钥 |
| `DEEPSEEK_BASE_URL` | LLM 端点（默认 `https://api.deepseek.com`） |
| `DEEPSEEK_MODEL` | 模型标识（默认 `deepseek-chat`） |
| `EVENT_ADMIN_TOKEN` | `/event/admin` 后台与 `/api/event/admin` 门禁 |
| `EVENT_BRIDGE_SECRET` | 验证 `channel="wechat"` 来源，必须与 Worker 侧完全一致 |

### ha7ch-event（`wrangler.toml [vars]` + `wrangler secret put`）

| 变量 | 类型 | 用途 | 必填 |
|---|---|---|---|
| `ADMIN_TOKEN` | secret | 守 `/admin*` 面板 | 是 |
| `EVENT_BRIDGE_SECRET` | 运行时 env | 与 home 共享，转发时带在 body.secret | 是（生产） |
| `BRIDGE_URL` | 运行时 env | home 引擎地址，默认 `https://www.ha7ch.com/api/event/chat` | 否 |
| `SUPABASE_URL` | 运行时 env | `/admin/send` 写 transcript 留痕用 | 否 |
| `SUPABASE_SERVICE_ROLE_KEY` | 运行时 env | 同上 | 否 |
| `LLM_API_KEY` | secret | 旧本地引擎用，死码 | 否 |
| `ALERT_WEBHOOK_URL` | secret | bot 异常告警（Discord/Slack） | 否 |

绑定资源（`wrangler.toml`）：D1 `DB`、KV `IMAGE_CACHE`（邀请函图片缓存）。

**契约关键点**：`EVENT_BRIDGE_SECRET` 在两个仓库里是同一个值，是整个跨仓信任的唯一凭据。任一侧改了忘了同步，微信渠道立刻全挂（home 返回 401）。

---

## 6. 筛选引擎机制速览（全在 ha7ch-home）

### 6.1 stage 状态机（`engine.ts`）

`handleTurn` 是唯一入口，按申请人当前 `stage` 路由（`routeByStage`）：

| stage | 处理函数 | 行为 |
|---|---|---|
| 无 active_event_id / 说「换活动」 | `runPicker` | 0 场开放→`NO_OPEN`；1 场→自动进入；多场→LLM 解析自由文本选活动 |
| `screening` | `handleScreening` | 多轮筛选打分，可转 accepted/waitlisted/rejected/继续 |
| `accepted` / `checked_in` | `handleAssistant` | 已通过，纯后勤陪聊，不再评分 |
| `waitlisted` / `rejected` | `handlePostDecision` | 已定稿，继续倾听，可能升级（只升不降） |

### 6.2 handleScreening 的几道额外闸

- **触顶轮**：`turn_count >= maxTurns`（活动可配 `max_turns`，默认 8，下限 `MIN_USER_TURNS+1`）时强制定稿，发固定收尾语 `SCREENING_CLOSER`，绝不再追问。这是防无限循环的硬闸。
- **最小轮次**：`MIN_USER_TURNS=5`，未到 5 轮一般不自动定稿，但硬红旗（newbie/course_seller/investor）可提前拒。
- **联系方式闸**：到了可定稿点且结论是 accept，但缺手机号或称呼任一，则不通过，先开口要号；触顶时不再追要，直接降候补。
- **占座**：转 accepted 时调 `store.claimSeat()` 分配从 1 起的座号。

### 6.3 `<<<SCORECARD>>>` 协议（`llm.ts`）

每一轮 LLM 回复尾部必须带一个 `<<<SCORECARD ...JSON... >>>` 块，否则系统无法记录判定。关键字段：四维分 `scores{project,scene,resource,thinking}`（各 0-4）、`probe_result`(held/collapsed/partial/n/a)、`red_flags[]`、`confidence`(0-1)、`faction`、`decision`(LLM 建议，后端会覆盖)、以及抽取出的 `display_name`/`phone`/`summary`。`screening` 留 1536 token 防截断。

四维打分尺度：0=无/追问坍塌，1=只有概念，2=有片段不够硬，3=有细节经得起追一层，4=有硬数字/硬卡点/硬链接越追越细。

### 6.4 deriveDecision 三道闸（`llm.ts`，后端权威重算）

LLM 的 `decision` 只是建议，后端用 `deriveDecision` 重新裁定，防止 LLM 决策被滥用：

```
total = 四维之和 (0-16)
peak = max(四维)
hardPeak = max(project, scene, resource)   // 思考维不许单维 4 走捷径
```

- **闸一 硬红旗**：含 newbie/course_seller/investor → 直接 reject；含 here_to_learn 且 `peak<3` → reject。
- **闸二 分数梯度**（先判 `shaky = (probe collapsed 或 evasive) 且 confidence<0.5`，shaky 时不许走捷径）：
  - `hardPeak>=4` 或 `total>=8` 或 `depthAccept`(held 且 hardPeak>=3 且非 evasive，救「窄而深」的真 builder) → accept；
  - 但若 `confidence<0.5 且 turn>=4` → 降候补（晚期低置信不盲过）；
  - 追问坍塌主导（collapsed 且 hardPeak<3）→ 拒（早期 <4 轮给一次 pending 翻盘）；
  - `total` 6-7 → 候补 + 人工复核（配局平衡也在这层人工拍）；
  - `total<=5` 或 shaky → 拒（早期给翻盘机会）。
- **闸三 置信度保护**：`confidence<0.5 且 turn>=4` 强制候补，不盲目自动拒，避免信息不足时伤人。

### 6.5 handlePostDecision 定稿后继续倾听（`engine.ts`）

已定稿（waitlisted/rejected）的人继续发消息时：

- **硬红旗婉拒**的人：无限倾听但不再复评，只回温和 hold 语。
- **其他人**：在 `baseCap`（≈max_turns）之上再放宽 `POST_DECISION_LISTEN_CAP=8` 轮，超过就回落温和 hold。
- 倾听过程仍静默刷 scorecard，**只升不降**：若复评升到 accept 且已有手机号+称呼，自动 `claimSeat` 并抬升到 accepted。

---

## 7. 重点评估：要不要把两个仓库合并成一个

把 ha7ch-event Worker 折叠进 ha7ch-home，本质是一个问题：**iLink webhook + session token 这套常驻有状态的东西，能不能塞进 Vercel serverless？**

下面三个方案客观摆开，先讲结论。

### 推荐：先做 C（清死码），再视情况做 B（抽共享契约包），暂不做 A（全合并）

**前提**：当前是 20-50 人规模的闭门局，cron 每分钟、约 1 分钟延迟可接受，iLink 是逆向协议、本身是 ToS 灰区且随时可能被微信改挂。在这个前提下，A（全合并）的收益不足以覆盖它的风险。

### 方案 A：全合并，iLink webhook 改成 Next.js route handler，token 移到 Supabase

把 Worker 整个删掉，`getUpdates` 长轮询 / `sendmessage` / 扫码逻辑搬进 home 的 route handler，D1 的 `users`（含 token）迁到 Supabase，cron 用 Vercel Cron。

- **工作量**：大。要重写 iLink 传输层到 Node fetch（加密上传、buildHeaders、长轮询都得搬）；D1 schema → Supabase 迁移 + DAO 重写（`claimUser` 的乐观锁要从 SQLite 改成 Postgres 行锁）；cron 模型从「常驻 1 分钟」改成 Vercel Cron。估 1-2 周。
- **好处**：单仓单部署，契约不再可能漂移（`EVENT_BRIDGE_SECRET` 直接消失，因为不再跨进程）；一处改 prompt 一处改 token 逻辑；类型天然共享。
- **坏处 / 风险**：
  1. **运行时不匹配是硬伤**。iLink 的长轮询每次 hold 25 秒，Vercel serverless function 有执行时长上限且按 wall-clock 计费，长轮询在 serverless 上要么烧钱要么被切。Cloudflare Worker 的 cron + CPU 限额是为这个场景天生合适的。
  2. **Vercel Cron 不是常驻**，最小粒度和稳定性都不如 Cloudflare cron，秒级轮询基本做不到，将来要「秒回」（Durable Objects 长连接）这条路在 home 侧根本走不通。
  3. **token 搬到 Supabase 的代价**：并发锁要重做，且每分钟全表扫描活跃用户、高频刷 `context_token` 会变成 Supabase 的写放大，成本和延迟都比 D1 边缘读写差。
  4. 把灰区逆向协议的代码搬进主站仓库，主站的部署稳定性会被 iLink 的不确定性绑架。

### 方案 B：维持现状，抽出共享类型 / 契约包

保持双仓，但把两边重复的东西（`Scorecard` 类型、`deriveDecision` 的判定语义、`/api/event/chat` 的 request/response 形状、stage 枚举、`@im.wechat` 后缀转换约定）抽成一个小的共享 npm 包或 git submodule，两仓都依赖它。

- **工作量**：小到中。1-3 天。
- **好处**：消除「契约漂移」这个唯一真实的痛点（今天靠人记得两边 `EVENT_BRIDGE_SECRET` 和 body 形状一致），同时完全保留各自最合适的运行时。
- **坏处 / 风险**：仍是两套部署、两个 CI、两处 secret 要维护；共享包本身引入版本管理负担。但这个负担远小于 A 的运行时迁移风险。

### 方案 C：Worker 瘦身到极致（保持双仓，但把死码删干净）

删掉 Worker 里的 `handleScreeningTurn`/`runPicker`/`routeByStage` 等全部死码和旧本地引擎（连同 `LLM_*` secret 和过时的 in-repo README），让 Worker 只剩 iLink I/O + bridge + admin/send，并加一份启动冒烟检查（校验 `EVENT_BRIDGE_SECRET` 已配、能 ping 通 `BRIDGE_URL`）。

- **工作量**：很小。半天到 1 天，纯删代码 + 加健康检查。
- **好处**：立刻消除「仓库里 README 和死码误导后人」的认知负担；Worker 职责一目了然。
- **坏处 / 风险**：没解决契约漂移的根（类型仍各写各的）；属卫生改善而非架构改善。

### 综合建议

先做 **C（立刻、低风险、清掉死码和过时 README）**，再视情况做 **B（把 Scorecard 类型和 bridge 契约抽成共享包）**。**不建议做 A**，除非出现以下任一前提：(1) 要把延迟从 1 分钟降到秒级且愿意上 Durable Objects（那时反而应该让 Worker 承接更多而非合并进 home）；(2) iLink 被官方渠道替代、微信 I/O 变成普通 HTTPS webhook（此时 serverless 接 webhook 才真正够用，长轮询的硬约束消失，A 的运行时矛盾才解除）。在这两个前提到来之前，「边缘常驻网关 + 无状态引擎」的双仓分工是与各自运行时特性匹配的正确形态。

---

## 附录：关键文件索引

### ha7ch-home（本仓库）

| 文件 | 作用 |
|---|---|
| `src/app/api/event/chat/route.ts` | 引擎 HTTP 入口，channel 鉴权 |
| `src/app/api/event/admin/route.ts` | 主办后台：看名单 / 人工改判 |
| `src/app/api/event/admin/transcript/route.ts` | 看单人完整对话 + 每轮评分卡 |
| `src/app/event/chat/page.tsx` | 网页测试报名入口 |
| `src/app/event/admin/page.tsx` | 主办后台 UI |
| `src/lib/event/engine.ts` | stage 状态机、联系方式闸、handlePostDecision |
| `src/lib/event/llm.ts` | system prompts、`<<<SCORECARD>>>` 协议、deriveDecision 三道闸 |
| `src/lib/event/store.ts` | Supabase 数据层 |
| `src/lib/event/pairing.ts` | 从 Worker 抓取扫码二维码会话（top-level img 用） |

### ha7ch-event（`~/dev/ha7ch-event`，独立仓库）

| 文件 | 作用 |
|---|---|
| `src/index.ts` | Worker 入口、cron tick、bridgeTurn、admin/send |
| `src/wechat.ts` | iLink 传输层：getUpdates、sendTextMessage、buildHeaders |
| `src/db.ts` | D1 DAO：claimUser 锁、refreshToken |
| `schema.sql` | D1 表结构 |
| `wrangler.toml` | Worker 部署配置、资源绑定 |
