# mee7 设计 spec

> AI-native Luma。Luma 验证的是报名表，mee7 验证的是人。
>
> 状态：v1 草案，待评审。基于 2026-06-11 的代码现状（ha7ch-home `3f4e1a3` + ha7ch-event worker）与线上真实数据（2 场活动、49 用户、47 份报名、630 轮对话）。
>
> 域名：mee7.ha7ch.com。命名沿 HA7CH 的 7 替换传统：mee7 = meet。

---

## 0. 一句话

mee7 是 AI 门房：Luma 让任何人都能办活动，mee7 让任何主办都请得起一个懂行的门卫。报名不是填表，而是和门房对话，说服它你够格坐上这张桌子。

---

## 1. 定位与世界观

### 1.1 对 Luma 的差异化是世界观，不是 feature

Luma 的世界观是流量型活动：报名越多越好，审批是事后人工清理（开 Require Approval 后主办逐个肉眼看表单，approve/decline），护城河是发现页和日历的网络效应。

mee7 的世界观是策展型活动：一张桌子只有 21 个座位，稀缺的不是触达而是构成，房间的质量本身就是产品。mee7 不和 Luma 抢分发，抢的是 Luma 永远不会认真做的那一环：裁决。

竞品调研确认这个中间地带完全空着：

- Luma 的审批是纯手工瓶颈，没有任何实质 AI（lumalabs.ai 是另一家公司）。
- 高端闭门社群（Dialog、Chief、On Deck）靠昂贵的人工判断换质量，吞吐量和体验极差：Chief 两万会员对六万 waitlist，排队一两年，全程黑箱。
- 最接近的 Perspective AI 只做报名意图洞察，不做资格裁决，更不管签到和现场。
- 中文市场（活动行、互动吧）只有表单加人工审核开关，零竞品。

mee7 做的是「规模化品味」：把闭门社群那种昂贵的判断力，变成中小主办雇得起的服务。四维评分、追问一层、人工改判留痕，是这个判断力的工程化形态。

### 1.2 品牌叙事直接用已验证的表述

这些话已被两场活动、630 轮真实对话验证过传播力，不要重写：

- 「你不是在填表，而是在说服 bot 你够格坐上这张桌子。」
- 「筛的是认知，不是职业。」
- 「bot 的杀手锏是追问一层：同一句话，真 builder 越追越具体，背词的人一追就塌。那句追问本身就是筛子。」
- 「门卫不再是人，门卫是一个过滤器。你贿赂不了它，作品是唯一的密码，没有后门。」（接《三百个陌生人》叙事）
- 「AI 提议，人来拍板。」

### 1.3 核心立场（全文反复出现，先立在这）

mee7 卖的不是「AI 审表单」，是「把主办的品味做成可复用的门规」。一切设计向 ScreeningProfile（门规）收敛：数值封死，叙事开放，人工永远握最终改判权。

---

## 2. 我们已经有什么：被验证的资产清单

产品化不是从零开始，是把一套已跑通的单租户系统抽出参数。现有资产按「原样保留 / 参数化 / 砍掉」分三类。

### 2.1 原样保留（已验证，不动）

| 资产 | 位置 | 为什么保 |
|---|---|---|
| `handleTurn` 状态机（channel-agnostic） | `src/lib/event/engine.ts` | web/微信同一引擎，已证明渠道解耦 |
| `deriveDecision` 服务端权威重算 | `src/lib/event/llm.ts` | LLM 的 decision 永远只是建议，评分权在服务端，这是抗注入和可审计的根 |
| `<<<SCORECARD>>>` 逐轮留痕协议 | `src/lib/event/llm.ts` | 每轮四维分、probe_result、红旗、置信度、人物速写全留痕，是审计证据也是数据飞轮原料 |
| 七态 stage 状态机 | `screening → accepted → invited → confirmed → checked_in`，旁路 `waitlisted / rejected` | 覆盖从筛选到现场的全旅程 |
| 联系方式硬闸 | accept 前必须有称呼 + 合法手机号，宁可候补不可失联 | 修过 10 位残号自动通过的真实事故 |
| postDecision 只升不降 | 定稿后继续倾听（上限 max_turns + 8 轮），静默复评只升不降 | 把拒绝做成体面的社交体验，不是考试出分 |
| stale 自动定稿 | 12 小时无消息按已存分数强制定稿 | 防止报名表永远挂着 |
| transcripts 回喂 raw | assistant 行存含 SCORECARD 的原文，回喂历史用 raw 不用 content | 注释标注 proven fix，防模型格式退化 |
| 惰性建档 | 不答开场问题不入库 | 防垃圾数据 |
| 判定与触达解耦 | bot 绝不当场宣判，口径只有「主办统一确认」；改判不自动通知 | 权力始终留在主办手里，错拒可救 |
| 配对轮询状态机、OG 四比例 + 3:4 导出卡管线 | `src/app/event/[slug]/` | 增长面资产，QR 指向落地页而非会过期的配对码 |

### 2.2 参数化（HA7CH 专属硬编码，产品化第一批工作）

- bouncer 人格整段 prompt（「内行不是客服」）与全部中文话术
- 术语白名单（harness/RAG/MCP/FDE/signoff 等，定义了「内行」是 AI builder 圈）
- 四种真实的圈层叙事、四派系（tech/founder/scene/research）、五红旗枚举（「投资人第一场一律不收」是 HA7CH 特例）
- 开场题「先聊聊你最近在做的最真的一件事吧」
- 中国手机号正则 `1[3-9]\d{9}`（需国际化为手机或邮箱二选一）
- 品牌资产：ha7ch logo、footer 标语、cityOf 只认三城、splitTitle 只剥 ha7ch 前缀、JSON-LD organizer 指向 ha7ch.com
- 单一全局 `EVENT_ADMIN_TOKEN`（上帝视角，多租户第一刀）
- worker 侧 `BRIDGE_URL` 与 `/admin/send` 默认 `event_id` 硬编码

### 2.3 砍掉

- 派系进自动判定的任何路径（降级为人工配桌参考标签）
- 主办自定义评分维度（见 4.2 的立场）
- `Roster.tsx` 假数据孤儿组件
- worker 里的全部 D1 本地引擎死码与数据已漂移的 D1 admin 看板

---

## 3. 对象模型

六个对象，门规是第一公民：

```
Organization (租户)
 └─ Organizer (成员, Supabase Auth)
 └─ ScreeningProfile (门规, 跨活动复用的品味资产)
     └─ Event (活动, 引用一份门规)
         └─ Application (报名, 七态状态机 + 逐轮评分留痕)
             └─ Conversation (对话, transcripts)
Guest (报名者, 按渠道身份标识, PII 落在 Application 级)
```

关键设计判断：

1. **门规独立成表，不内嵌在活动里。** 主办的品味是跨活动复用的资产：办十场调十次，门规越来越准。活动是消耗品，门规是账户资产，这是 mee7 对 Luma 的数据壁垒所在。
2. **Guest 不做全局身份。** 申请人的渠道身份（web uid / 微信 id）可以全局，但 display_name、phone 这些 PII 下沉到 Application 级。否则一个用户在 A 主办场留的手机号会被 B 主办看到，这是产品化第一颗隐私雷。跨活动 guest 画像复用（聊过一次不必重新自证）是 V2 议题，且必须 opt-in。
3. **Application 七态机和 scorecard 留痕原样保留**，每一次人工改判都是主办品味的标注信号，飞轮从第一天就开始转。

---

## 4. 筛选引擎与门规

### 4.1 引擎内核：数值封死

以下全部锁死在引擎，主办不可见也不可改：

- 四维结构：project / scene / resource / thinking，各 0 到 4 分（0=追问坍塌，1=纯概念，2=有片段，3=经得起追一层，4=硬数字硬链接越追越细）
- `deriveDecision` 三道闸：
  - 闸一硬红旗即拒；here_to_learn 且 peak<3 拒
  - 闸二分数：total>=9 且非 shaky 通过；6-8 候补 + 人工复核；<=5 或 shaky 拒；shaky =（追问塌或闪避）且 confidence<0.5，排在分数闸前，封死「吹一维到 4 但一追就塌」的捷径；thinking 不计入 hardPeak，防宏大叙事单维走捷径
  - 闸三置信度：confidence<0.5 且 turn>=4 强制候补，不盲拒
- 节奏常量：MIN_USER_TURNS=5、max_turns 默认 8 触顶发固定收尾语、POST_DECISION_LISTEN_CAP=8、stale 12 小时
- 追问纪律：同点最多追一到两层就换方向，防审问感

理由：这套数值是和 prompt 整体调校出来的（pass line 从 8 调到 9、删掉单维满分捷径、shaky 闸，都是真实活动里逐场修出来的），拆开必坏。普通主办没有能力也不应该校准评分系统，就像 Stripe 不让商户调风控阈值。

### 4.2 门规（ScreeningProfile）：叙事开放

主办能配的恰好四样，全部是叙事层，不碰数值：

1. **门规叙事（brief）**：「本场侧重什么、最怕混进谁」。现有机制已支持 brief 注入且声明冲突时以 brief 为准，这是现成的主办自定义入口。
2. **圈子词典**：术语白名单定义「内行」。AI 圈换咖啡圈，就换一本词典，四维骨架不动，每维的圈层化举例随词典走。
3. **红旗开关**：预置清单（newbie / here_to_learn / course_seller / investor / evasive）勾选启停。investor 必拒默认关，那是 HA7CH 特例。
4. **严格度单旋钮**：宽 / 标准 / 严三档，映射为阈值整体偏移。这是唯一的数值入口，且只暴露三档。

另有两个非筛选配置：配桌标签（主办自定义 2 到 5 个标签，替代硬编码四派系，只供人工配桌参考，绝不进 deriveDecision）和 bot 人格模板（内行门房 / 热情主理人 / 严肃评审三选，解决「被 bot 盘问劝退大佬」的人格适配）。

HA7CH 的「四种真实 + 内行 bouncer + 五红旗」整套作为第一个内置模板。模板库四个起步：闭门 builder 局、demo night、行业晚宴、社群招新。

### 4.3 白名单直通（MVP 必须，不是 V2）

主办贴名单或发专属免筛链接，命中者跳过筛选直接 invited。

理由：竞品调研里最大的单点风险是高价值嘉宾对「向 AI 自证」容忍度最低，错拒一个 VIP 的品牌代价极高。没有旁路，mee7 在高端局场景死于第一次大佬被盘问。配合「bot 绝不当场宣判、人工可改判」的既有机制，对外卖点是：AI 提议，人拍板，错拒可救。

---

## 5. 用户旅程

### 5.1 Organizer：对话式建活动，吃自己狗粮

1. **登录**：Supabase Auth magic link，进 org。
2. **建活动**：不填配置表单，和 mee7 的 bot 聊五分钟。bot 追问出门规草稿（侧重什么、怕混进谁、词典、红旗、严格度），正是 mee7 自己的筛选哲学反过来用在主办身上。
3. **试聊预览（强制）**：发布前主办必须扮演 guest 跑三轮，亲眼看门房怎么问、评分卡怎么打。现成的 `/event/chat` 测试台就是这个功能的雏形。确认才能发布。
4. **分享**：拿到 `mee7.ha7ch.com/e/{slug}` 落地页 + OG 卡 + 3:4 导出卡（发朋友圈/群）。
5. **看板**：现有 admin 全部能力按 org 隔离后保留：七态计数、四维分、人物速写、复核队列、点开任何人的完整对话流和逐轮评分卡、三键改判（accept/waitlist/reject，写 human_decided）。
6. **发函**：判定与触达解耦保持，通过者由主办统一发函（邮件/短信），地址只在此刻透露。
7. **复盘**：活动结束落 recap，落地页转为战报页（现有 recap_json 机制）。

验收标准：一个非 HA7CH 的主办，30 分钟内独立办起一场带筛选的活动。

### 5.2 Guest：链接到入场

1. **看到链接**：落地页保留现有极简信息架构（标题、时间城市、信息表、brief），地址保密策略保留：「确认后由主办统一通知到场的人」。
2. **进对话**：MVP 走 web 对话（点「和门房聊两句」直接开聊）；微信扫码配对是 V2 增值渠道（见第 8 节）。
3. **被筛**：多轮对话，bot 追问一层，第 1-2 轮要称呼和联系方式。全程不暴露规则、不当场宣判。
4. **收函**：通过者收到主办统一发的邀请函与地址。
5. **签到与牵线（V2）**：到场发条消息即签到（不扫码），bot 采集「今天想解决的问题 / 想认识谁」，告诉你去认识谁。筛选时学到的 problem / wants_to_meet 在门口变成三个该认识的人。竞品报告确认这个「审核 + 签到 + 现场牵线」的数据闭环没有任何人做，这是 mee7 真正的护城河。
6. **被拒也体面**：定稿后继续倾听，只升不降，复评过线且有联系方式自动抬升。

---

## 6. 架构

### 6.1 部署形态：留在 ha7ch-home，子域路由，不拆仓

mee7 作为 ha7ch-home 内的路由组（`src/app/(mee7)/`），Vercel 同项目挂 mee7.ha7ch.com，middleware 按 host 路由。

理由：引擎全部活在 `src/lib/event`，拆独立 app 意味着抽包、双部署、双 env，换来的只是「看起来像创业公司」。「合并 master 即部署」的管线已是肌肉记忆。代价是品牌耦合，但这是验证成功之后才需要操心的烦恼。

一条纪律换未来的可拆性：`src/lib/event` 重命名为 `src/lib/mee7-core`，保持纯函数、零 Next 依赖，未来拆仓只动 import。

### 6.2 LLM 层：平台统一持 key，不做 BYOK

平台持 DeepSeek key（env 可换 model/baseUrl，按 org 可覆盖型号）。算账：630 轮对话筛了 47 人，单申请约 13 轮，DeepSeek 下单申请成本不到 5 分钱。按场定价毛利 95% 以上，BYOK 的 key 管理复杂度完全不值得引入。加一张 usage 表按 org 记 token 与申请数，配限额防滥用。

### 6.3 必修技术债（产品化前置，不是可选项）

| 债 | 现状 | 修法 |
|---|---|---|
| claimSeat 非原子 | read-then-write，注释自认低并发够用 | 改 Postgres RPC，原子分配 + seat_no<=seat_total 超卖校验 |
| 全局 admin token | 明文 query 传输，看全部活动 | 砍掉，换 Supabase Auth + org scoping |
| web userId 自报无防伪 | localStorage 随机 uid，可冒充 | 加服务端签名 session |
| RLS 全关 | service role 直连 | 业务鉴权留在 API 层（requireOrg()），但所有表开 deny-all RLS，确保 anon key 读不到任何东西 |
| userId 渠道后缀两处拼接 | `@im.wechat` 散落两仓 | 统一为 `{channel}:{id}` |
| worker 死码与漂移看板 | D1 本地引擎死码、admin 看板读已不再写入的表 | 直接删 |

---

## 7. 数据模型

在现有五张表上演化，不推倒。epoch ms 时间戳、text 主键、应用层 join 都不动，不值得迁移。

### 7.1 新增

```sql
organizations    org_id PK, name, slug, plan, llm_model, created_at
organizers       user_id (Supabase Auth) + org_id, role, 复合键
screening_profiles  profile_id PK, org_id, name,
                    config_json  -- brief 模板、词典、红旗开关、严格度、
                                 -- 配桌标签、人格模板、开场题、语言包
org_usage        org_id, period, tokens, applications, events
```

### 7.2 改动

```
event_events        + org_id, + profile_id；slug 唯一性改为 org 内唯一
event_users         保留渠道身份与 active_event_id（共享 bot 路由必需）；
                    display_name / phone 下沉到 event_applications（PII 按租户隔离）
event_applications  + display_name, + phone（从 users 下沉）；
                    + email（联系方式国际化：手机或邮箱二选一过闸）
event_transcripts   不动
```

### 7.3 不动

七态 stage 枚举、四维分列、scorecard_json、needs_human_review、human_decided、seat_no、invite_sent_at、checked_in_at、turn_count、decided_at、recap_json，以及 `mustWrite` 显式查错包装（supabase-js 静默丢写的教训）。

---

## 8. 渠道

### 8.1 立场：web 是第一渠道，微信是增值体验

iLink 微信桥是 HA7CH 自己活动的体验护城河，但作为创业产品的默认通道风险不可接受：

- 逆向协议，ToS 灰区，随时可能被微信改挂
- 不能主动触达从未扫码的人，token 随会话过期（errcode -14 后必须重新扫码）
- 只能收发文本和图片，没有链接/卡片消息，邀请函只能做成图片
- 渠道层无租户概念：一个 worker 就是一个 bot 人设

引擎本就 channel-agnostic，`/event/chat` 已验证 web 渠道全流程。MVP 用 web 对话 + 邮件/短信发函，全球可用、可演示、可收费。微信对客户的承诺定位为增值体验，不做 SLA；中期接企业微信或公众号官方接口兜底。

### 8.2 ChannelAdapter：固化 bridgeTurn 契约

现有跨仓契约（POST `{userId, text, channel, secret}` 返回 `{replies: string[]}`）抽象为渠道接口：

```ts
interface ChannelAdapter {
  channel: string                       // "web" | "wechat" | "telegram" | ...
  capabilities: { canPush: boolean; supportsRichMedia: boolean }
  // 入站: { channel, channelUserId, text } -> handleTurn
  // 出站: { replies: string[] } -> 渠道各自渲染
}
```

微信上多租户的形态：**mee7 官方共享 bot**。一个 worker、一个 iLink bot 服务所有租户，picker 协议天然支持跨主办选活动。坚决不做每租户独立部署（iLink 没有多账号参数，运维不可摊销）。隐私靠 PII 下沉到 Application 级解决。

第三渠道选 Telegram 而非 WhatsApp：官方 bot API、每 org 可绑自己的 token、接入成本近零，正好覆盖海外 builder 圈。WhatsApp Business API 留给有付费客户再做。

### 8.3 微信渠道的产品约束（必须暴露给主办，不藏）

- 端到端延迟约 1 分钟（cron 最小粒度），用「考官斟酌」人设消化
- 沉默用户触达会失效，关键消息（邀请函、提醒）依赖用户主动来过话
- 中登 BOT 四个死因的教训已内建：不发外链、不群发、token 在用户主动对话时天然新鲜

---

## 9. MVP / V2 划分

### MVP 八件套（目标：HA7CH 下一场活动跑在 mee7 上，并 onboard 第一个外部主办）

1. org 模型 + Supabase Auth 登录 + 租户隔离
2. 对话式建活动 + 强制试聊预览
3. 落地页 `mee7.ha7ch.com/e/{slug}`（含 OG 卡管线）
4. web 门房对话（现有引擎 + 门规参数化）
5. admin 看板多租户化（七态 + 评分卡透视 + 三键改判）
6. 白名单 / 免筛邀请链接
7. 邮件 / 短信发函（判定与触达解耦保持）
8. claimSeat 原子化 + 超卖校验

验收标准：一个非 HA7CH 主办 30 分钟内独立办起一场带筛选的活动。

### V2

- 微信共享 bot 渠道（含配对 UX 移植）
- 签到 + 现场牵线闭环（problem / wants_to_meet 驱动「去认识 #X」）
- 3:4 导出卡多租户化、「Screened by mee7」署名
- 跨活动 guest 画像复用（opt-in）
- 付费、usage 计量、API

### 不做

- 免费大盘（见 10.2）
- 活动发现页 / 日历订阅（那是 Luma 的战场）
- 票务抽成（策展型闭门局多数免票，模型不成立）
- 主办自定义评分维度与阈值

---

## 10. 定价与 GTM

### 10.1 第一圈客群

中文市场、AI/创投圈、50 人以下闭门局的主办和社群主理人，先上海北京深圳。理由：中文市场零竞品；「在微信里说服 bouncer」的仪式感在中文场景最成立；HA7CH 在这个圈子有现成口碑。demo day 和 hackathon 初筛是第二圈，现在不分心。

### 10.2 定价：按场收费，不抽成，不做免费大盘

- 单场 ¥599：50 席内全流程筛选、后台、落地页、导出卡
- 订阅 ¥299/月：含每月 1 场

逻辑：一场 LLM 成本不到 ¥10，对主办是一顿饭钱，决策无摩擦。明确不做免费大盘：免费会引来流量型主办，污染品味数据，也稀释「被筛是荣誉」的心智。

### 10.3 冷启动：HA7CH 自有活动是 living demo

1. 每场落地页和导出卡加「Screened by mee7」署名。被筛者本人就是获客漏斗：这群 builder 里主理人密度极高，定稿后话术加一句「想给你的局也配个门卫」。
2. 把 49 人 630 轮的真实数据写成内容（通过率、追问坍塌率、复评翻盘案例），接上《三百个陌生人》的叙事发酵。
3. 手动 onboard 3 到 5 个圈内灯塔主办做 design partner，和他们共写 brief，逼出门规参数化的真实需求清单。这比闭门抽象「四维改 N 维」可靠得多。

---

## 11. 风险与对策

LLM 成本不是风险（单场不到 ¥10），不列。真正的四个：

1. **iLink 灰区**。逆向协议随时可死。对策：引擎渠道无关已验证，web 升为对客户承诺的主渠道，微信定位增值体验不做 SLA，中期接企业微信/公众号官方接口兜底。
2. **高价值嘉宾拒绝向 AI 自证，错拒 VIP 最伤品牌**。对策：白名单/免筛链接进 MVP；「AI 提议人拍板、bot 绝不当场宣判、错拒可救」做成对外卖点；人格模板分内行与恭敬档。
3. **主办滥用筛选造成歧视**。对策：rubric 平台层锁死在行为证据（四维全是「做过什么」，不是「你是谁」）；brief 注入过一道平台审核；ToS 禁止按受保护属性筛人；scorecard 全程留痕本身就是审计证据。
4. **Luma 一个 feature flag 抄走薄层**。对策：数据飞轮。每次人工改判都是主办品味的标注信号，积累成「这个主办要什么人」的模型，这层抄不走；且中文市场 Luma 不会先来。防注入已是 system prompt 的一部分（不暴露规则、评分权在服务端），V2 可加 LinkedIn 等外部信号核验。

---

## 12. 迁移路径（按周）

| 周 | 工作 | 产出 |
|---|---|---|
| W1 | org 模型 + auth + admin 多租户化；claimSeat RPC；deny-all RLS；`lib/event` 改名 `lib/mee7-core` | 多租户骨架立起来，HA7CH 成为第一个 org |
| W2 | 门规表 + llm.ts 全部 prompt 模板化（HA7CH rubric 成为内置模板一号）；对话式建活动 + 试聊预览；落地页与 OG 管线挂 mee7.ha7ch.com | 外部主办可以自助建活动 |
| W3 | web 渠道打磨（签名 session、邮件/短信发函、白名单直通）；联系方式国际化 | MVP 验收：外部主办 30 分钟独立办一场 |
| W4+ | 微信共享 bot（worker 去硬编码、删死码、统一 userId 前缀）；签到牵线闭环 | V2 |

直接搬的代码：engine.ts 状态机、deriveDecision、normalizeScorecard、transcripts raw 回喂、mustWrite、配对轮询状态机、OG/导出卡管线。参数化重写：llm.ts 全部 prompt、store.ts 加 org scoping、normalizePhone 国际化。全新：org/auth、主办 onboarding、usage 计量。

---

## 附录 A：与 Luma 的功能对照

| 环节 | Luma | mee7 |
|---|---|---|
| 报名 | 表单（可自定义问题） | 对话（门房追问一层） |
| 审批 | 人工逐个看表单，approve/decline | AI 评分 + 三道闸自动定稿，边界态人工复核，三键改判 |
| 审批依据 | 主办肉眼 | 四维评分卡逐轮留痕，可审计 |
| 通知 | 邮件模板 | 判定与触达解耦，主办统一发函，地址过闸才透露 |
| 签到 | 邮件 QR 扫码 | 发条消息即签到（V2） |
| 现场 | 无 | 牵线：筛选时学到的 problem/wants_to_meet 变成「去认识谁」（V2） |
| 被拒体验 | 拒信 | 不宣判、继续倾听、只升不降、复评可翻盘 |
| 收费 | 免费 + Plus $59/月 + 票务抽 5% | 按场 ¥599 / 订阅 ¥299 月，不抽成 |

## 附录 B：名词表

| 词 | 含义 |
|---|---|
| 门房 / bouncer | 与 guest 对话的筛选 bot 人格 |
| 门规 / ScreeningProfile | 主办可配置的筛选叙事层：brief、词典、红旗开关、严格度、配桌标签、人格模板 |
| 四种真实 | project / scene / resource / thinking 四维评分骨架（平台锁死） |
| 三道闸 | deriveDecision 的硬红旗、分数梯度、置信度保护 |
| 追问一层 | 按主张类型要第一手证据（数字/卡点/用户链接/资源边界/反共识），同点最多追一到两层 |
| 只升不降 | 定稿后继续倾听，复评只能向上改判 |
| 判定与触达解耦 | bot 不宣判，通知由主办统一发出 |
