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

1. mee7 卖的不是「AI 审表单」，是「把主办的品味做成可复用的门规」。一切设计向 ScreeningProfile（门规）收敛：数值封死，叙事开放，人工永远握最终改判权。
2. mee7 是 agent-first 的，AI 贯穿两端：guest 端的门房是 AI，主办端的操作台是主办自己的 agent。主办方把自己的 Claude Code 经 MCP 接上 mee7，建活动、调门规、看报名、改判、发函、写复盘全在自己的 agent 里完成；web 后台只是看板。Luma 给主办一个 dashboard，mee7 给主办的 agent 一套工具。
3. 注册的不对称是刻意的：主办方注册，参会者永远零注册。guest 的身份就是微信，扫码即入口，没有账号没有密码没有 App。

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
- 中国手机号正则 `1[3-9]\d{9}`（保留：微信渠道即中文市场，国际化随海外渠道再说）
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
2. **Guest 零注册、不做全局身份。** 参会者从头到尾不注册 mee7：微信身份即身份，扫码即入口。渠道身份（微信 id / web uid）可以全局，但 display_name、phone 这些 PII 下沉到 Application 级。否则一个用户在 A 主办场留的手机号会被 B 主办看到，这是产品化第一颗隐私雷。跨活动 guest 画像复用（聊过一次不必重新自证）是 V2 议题，且必须 opt-in。
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

### 5.1 Organizer：你的 Claude Code 就是活动运营台

1. **注册**：mee7 自有账号，邮箱 + 密码注册（MVP 不做微信扫码登录），建 org，设置页生成 MCP 接入 token。任何人都可以注册，这是 SaaS，不是邀请制工具；底层用 Supabase Auth 实现，但主办方全程只见 mee7，不需要注册任何第三方。这是整个产品里唯一需要注册的角色。
2. **连接 Claude Code**：`claude mcp add mee7 ...` 一行接入。从这一刻起，建活动、调门规、看报名、改判、发函、写复盘，全部在主办自己的 agent 里完成。HA7CH 过去两场活动的运营本来就是这么跑的，mee7 把这套已验证的工作流原样产品化。
3. **建活动**：对自己的 Claude 说「帮我办一场 30 人的闭门局，最怕混进来卖课的」，agent 经 MCP 追问出门规草稿（侧重什么、怕混进谁、词典、红旗、严格度），正是 mee7 自己的筛选哲学反过来用在主办身上。没有 Claude Code 的主办走 web 向导（和 mee7 的 bot 聊五分钟），是同一套工具的薄壳。
4. **试聊预览（强制）**：发布前必须用 `test_screening` 跑三轮（agent 里跑，或 web 测试台），亲眼看门房怎么问、评分卡怎么打。现成的 `/event/chat` 测试台就是这个功能的雏形。确认才能发布。
5. **分享**：拿到 `mee7.ha7ch.com/e/{slug}` 落地页 + OG 卡 + 3:4 导出卡（发朋友圈/群）。
6. **运营**：web 看板看全景（七态计数、四维分、人物速写、复核队列、完整对话流和逐轮评分卡、三键改判）；批量和模糊操作交给 agent：「把复核队列里做硬件的挨个看一遍捞进来」「给 confirmed 但没回话的人再提醒一轮」，这类一句话操作在看板上是无数次点击，在 agent 里是一个回合。
7. **发函**：判定与触达解耦保持，通过者由主办经微信统一发函（现有 `/admin/send` 链路多租户化：查 D1 token 直发 + Supabase 留痕），地址只在此刻透露。
8. **复盘**：让 agent 写 recap 落库，落地页转为战报页（现有 recap_json 机制）。

验收标准：一个非 HA7CH 的主办，30 分钟内独立办起一场带筛选的活动。

### 5.2 Guest：链接到入场

1. **看到链接**：落地页保留现有极简信息架构（标题、时间城市、信息表、brief），地址保密策略保留：「确认后由主办统一通知到场的人」。
2. **进对话**：扫码配对进微信 bot（现有 EventPairing UX 原样复用：落地页内嵌顶层 QR 图、微信内长按识别、2.5 秒轮询激活态、过期自动换码），回微信和门房开聊。
3. **被筛**：多轮对话，bot 追问一层，第 1-2 轮要称呼和联系方式。全程不暴露规则、不当场宣判。
4. **收函**：通过者收到主办统一发的邀请函与地址。
5. **签到与牵线（V2）**：到场发条消息即签到（不扫码），bot 采集「今天想解决的问题 / 想认识谁」，告诉你去认识谁。筛选时学到的 problem / wants_to_meet 在门口变成三个该认识的人。竞品报告确认这个「审核 + 签到 + 现场牵线」的数据闭环没有任何人做，这是 mee7 真正的护城河。
6. **被拒也体面**：定稿后继续倾听，只升不降，复评过线且有联系方式自动抬升。

---

## 6. 架构

### 6.1 部署形态：独立 SaaS 项目，event 系统整体迁出

mee7 是一个单独的项目，不是 ha7ch-home 的子模块：

- **新仓库**（HA7CH/mee7，private，平台闭源），独立 Next.js app，独立 Vercel 项目挂 mee7.ha7ch.com（将来随时可换独立域名），沿用「合并 master 即部署」管线。
- **迁移方式是搬家不是共享**：把 ha7ch-home 的 `src/lib/event`（引擎）、`src/app/event`（页面）、`src/app/api/event`（API）整体迁入 mee7 仓库（引擎落位 `lib/core`，保持纯函数、零 Next 依赖）。ha7ch-home 删掉 event 代码，只留 `ha7ch.com/event/*` 到 `mee7.ha7ch.com/e/*` 的 301，回归官网本体。不做两仓共享引擎，没有抽包同步的负担。
- **数据库沿用现有 Supabase 项目**：表已是 `event_` 前缀，两场存量活动的数据原地变成 HA7CH org 的资产，零迁移成本。
- **ha7ch-event worker 保持独立仓库**（微信桥的运行时本来就和 Next.js 不同），`BRIDGE_URL` 改指 mee7 的 chat API。

最终形态三个部署面，各归其位：mee7（SaaS 本体：引擎 + 落地页 + 看板 + MCP）、ha7ch-event worker（微信哑网关）、ha7ch-home（HA7CH 官网，与 mee7 只剩链接关系）。

### 6.2 LLM 层：平台统一持 key，不做 BYOK

平台持 DeepSeek key（env 可换 model/baseUrl，按 org 可覆盖型号）。算账：630 轮对话筛了 47 人，单申请约 13 轮，DeepSeek 下单申请成本不到 5 分钱。按场定价毛利 95% 以上，BYOK 的 key 管理复杂度完全不值得引入。加一张 usage 表按 org 记 token 与申请数，配限额防滥用。

### 6.3 mee7 MCP：主办方的 Claude Code 是第一操作台

mee7 对主办方是 agent-first 的：web 后台只是看板，完整操作面是一个远程 MCP server。主办方把自己的 Claude Code（或任何 MCP 客户端）接上来，活动运营的全部动作都由自己的 agent 执行。工具清单不是凭空设计的，就是把 HA7CH 两场活动在 Claude Code 里实际执行过的运营动作逐一工具化。

- 端点：`mee7.ha7ch.com/mcp`（Streamable HTTP，跑在 Next.js route 里，与引擎和数据同进程，不引入新部署面）
- 鉴权：org 设置页生成 API token，token 即租户 scope，所有工具天然按 org 隔离
- 工具集 v1：

| 工具 | 对应现有动作 |
|---|---|
| `create_event` / `update_event` | 建活动、改时间地址座位数、open/close |
| `update_screening_profile` | 调门规：brief、词典、红旗开关、严格度、人格模板 |
| `test_screening` | 试聊预览：模拟 guest 跑一轮，返回门房回复 + 评分卡 |
| `list_applications` | 报名全景：按 stage / 复核队列 / 关键词筛 |
| `get_transcript` | 单人完整对话 + 逐轮评分卡 |
| `override_decision` | 改判 accept/waitlist/reject，写 human_decided |
| `send_message` | 经微信桥统一发函（`/admin/send` 链路），Supabase 留痕 |
| `generate_cards` | OG 卡 / 3:4 导出卡链接 |
| `write_recap` | 写复盘 recap_json，落地页转战报 |

边界：MCP 工具不暴露引擎数值（阈值、闸门），`override_decision` 是人类拍板动作，工具描述里要求 agent 在改判前向主办确认。web 看板与 MCP 调同一套 service 层，不出现两套业务逻辑。

### 6.4 必修技术债（产品化前置，不是可选项）

| 债 | 现状 | 修法 |
|---|---|---|
| claimSeat 非原子 | read-then-write，注释自认低并发够用 | 改 Postgres RPC，原子分配 + seat_no<=seat_total 超卖校验 |
| 全局 admin token | 明文 query 传输，看全部活动 | 砍掉，换 mee7 登录态 + org scoping |
| web userId 自报无防伪 | localStorage 随机 uid，可冒充 | web 降为主办内部测试台后优先级降低，挂 organizer 登录态即可 |
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
event_applications  + display_name, + phone（从 users 下沉）
event_transcripts   不动
```

### 7.3 不动

七态 stage 枚举、四维分列、scorecard_json、needs_human_review、human_decided、seat_no、invite_sent_at、checked_in_at、turn_count、decided_at、recap_json，以及 `mustWrite` 显式查错包装（supabase-js 静默丢写的教训）。

---

## 8. 渠道

### 8.1 立场：微信是唯一对外渠道，现有桥直接复用

mee7 不做 web 对外报名。微信就是报名渠道本身，理由有三：

- 「在微信里说服 bouncer」的仪式感是产品体验的本体，不是可替换的传输层。落地页扫码、回微信和门房聊、邀请函图片、到场发条消息签到，整条旅程长在微信里才成立。
- 第一圈客群（中文 AI/创投圈闭门局）的主办和 guest 百分之百活在微信里。给他们一个 web 聊天框是降级，不是兜底。
- 桥已经跑通了。配对 UX、token 生命周期、并发锁、统一发函链路全部是验证过的资产，复用成本接近零，重做 web 渠道反而是新增工作量。

web `/event/chat` 退回它的真实角色：主办试聊预览（5.1 第 3 步）和开发回归测试台，不对外暴露为报名入口。

### 8.2 微信多租户形态：mee7 官方共享 bot

一个 worker、一个 iLink bot 服务所有租户，picker 协议天然支持跨主办选活动（多场开放时 LLM 用 `<<<PICK>>>` 解析自由文本选活动，服务端校验防编造）。坚决不做每租户独立部署：iLink 没有多账号参数，运维不可摊销。隐私靠 PII 下沉到 Application 级解决（7.2）。

worker 侧产品化只有三件事：`BRIDGE_URL` 与 `/admin/send` 默认 `event_id` 去硬编码、欢迎语等话术随门规走、删 D1 死码和漂移看板。引擎侧的 bridgeTurn 契约（POST `{userId, text, channel, secret}` 返回 `{replies: string[]}`）保持不动，它已经是干净的渠道接口；userId 统一为 `{channel}:{id}` 消灭 `@im.wechat` 后缀两处拼接的债。

引擎保持 channel-agnostic 是底线纪律：这不是为了现在就接第二渠道，而是 iLink 桥万一被微信改挂时，数据真相全在 Supabase，换企业微信或公众号官方接口重接一个桥，业务零丢失。海外渠道（Telegram 官方 bot API 成本最低）留到有真实海外需求再说，不进任何近期计划。

### 8.3 微信渠道的产品约束（必须暴露给主办，不藏）

- 端到端延迟约 1 分钟（cron 最小粒度），用「考官斟酌」人设消化
- 沉默用户触达会失效，关键消息（邀请函、提醒）依赖用户主动来过话
- 中登 BOT 四个死因的教训已内建：不发外链、不群发、token 在用户主动对话时天然新鲜

---

## 9. MVP / V2 划分

### MVP 十件套（目标：HA7CH 下一场活动跑在 mee7 上，并 onboard 第一个外部主办）

1. org 模型 + mee7 自有注册登录（邮箱 + 密码，任何人可注册，底层 Supabase Auth，主办方无感知）+ 租户隔离（guest 全程零注册）
2. mee7 MCP server（6.3 全套工具 + token 鉴权），主办方 Claude Code 即操作台
3. 对话式建活动 + 强制试聊预览（MCP 主路，web 向导辅路）
4. 落地页 `mee7.ha7ch.com/e/{slug}`（含 OG 卡管线 + 扫码配对 UX）
5. 微信共享 bot 渠道（现有 iLink 桥复用：worker 去硬编码、删死码、userId 统一前缀）
6. admin 看板多租户化（七态 + 评分卡透视 + 三键改判）
7. 白名单 / 免筛邀请链接
8. 微信统一发函（`/admin/send` 链路多租户化，判定与触达解耦保持）
9. claimSeat 原子化 + 超卖校验
10. 存量迁移：HA7CH 已办两场活动以 closed + recap 状态迁入 mee7，`ha7ch.com/event/*` 301 到 `mee7.ha7ch.com/e/*`，首页活动入口改指 mee7。mee7 上线第一天就带着两场真实活动的战报页，不是空盘子

验收标准：一个非 HA7CH 主办 30 分钟内独立办起一场带筛选的活动。

### V2

- 签到 + 现场牵线闭环（problem / wants_to_meet 驱动「去认识 #X」）
- 3:4 导出卡多租户化、「Screened by mee7」署名
- 跨活动 guest 画像复用（opt-in）
- 付费、usage 计量、API
- 企业微信 / 公众号官方接口兜底通道调研

### 不做

- 票价代收与票务功能
- 活动发现页 / 日历订阅（那是 Luma 的战场）
- 票务抽成（策展型闭门局多数免票，模型不成立）
- 主办自定义评分维度与阈值

---

## 10. 定价与 GTM

### 10.1 第一圈客群

中文市场、AI/创投圈、50 人以下闭门局的主办和社群主理人，先上海北京深圳。理由：中文市场零竞品；「在微信里说服 bouncer」的仪式感在中文场景最成立；HA7CH 在这个圈子有现成口碑。demo day 和 hackathon 初筛是第二圈，现在不分心。

### 10.2 定价：当前免费，商业化后置

创始人拍板：MVP 阶段全免费，任何人注册即用，先把主办数量和门规数据飞轮转起来。一场 LLM 成本不到 ¥10，免费期烧不出窟窿；org_usage 计量从第一天就记，免费不等于不算账。

未来引入付费时的方向保留：按场收费、不抽票务成（策展型闭门局多数免票，抽成模型不成立）。免费引来流量型主办污染品味数据的风险，靠「筛选体验本身的门槛」和后续分层缓解，不靠价格墙。

### 10.3 冷启动：HA7CH 自有活动是 living demo

1. 每场落地页和导出卡加「Screened by mee7」署名。被筛者本人就是获客漏斗：这群 builder 里主理人密度极高，定稿后话术加一句「想给你的局也配个门卫」。
2. 把 49 人 630 轮的真实数据写成内容（通过率、追问坍塌率、复评翻盘案例），接上《三百个陌生人》的叙事发酵。
3. 手动 onboard 3 到 5 个圈内灯塔主办做 design partner，和他们共写 brief，逼出门规参数化的真实需求清单。这比闭门抽象「四维改 N 维」可靠得多。

---

## 11. 风险与对策

LLM 成本不是风险（单场不到 ¥10），不列。真正的四个：

1. **iLink 灰区**。逆向协议随时可死，而且现在是唯一对外渠道，这是 mee7 最大的单点。对策分三层：数据真相全在 Supabase，桥挂了换桥不丢任何业务数据；引擎 channel-agnostic 是底线纪律，web 测试台保证引擎随时可演示可回归；中期调研企业微信/公众号官方接口做兜底通道（V2 列项）。另外中登 BOT 四个死因的教训已内建（不发外链、不群发、用户主动对话时 token 天然新鲜），当前用法本身就是 iLink 上最低风险的形态。
2. **高价值嘉宾拒绝向 AI 自证，错拒 VIP 最伤品牌**。对策：白名单/免筛链接进 MVP；「AI 提议人拍板、bot 绝不当场宣判、错拒可救」做成对外卖点；人格模板分内行与恭敬档。
3. **主办滥用筛选造成歧视**。对策：rubric 平台层锁死在行为证据（四维全是「做过什么」，不是「你是谁」）；brief 注入过一道平台审核；ToS 禁止按受保护属性筛人；scorecard 全程留痕本身就是审计证据。
4. **Luma 一个 feature flag 抄走薄层**。对策：数据飞轮。每次人工改判都是主办品味的标注信号，积累成「这个主办要什么人」的模型，这层抄不走；且中文市场 Luma 不会先来。防注入已是 system prompt 的一部分（不暴露规则、评分权在服务端），V2 可加 LinkedIn 等外部信号核验。

---

## 12. 迁移路径（按周）

| 周 | 工作 | 产出 |
|---|---|---|
| W1 | 新建 mee7 仓库 + Vercel 项目，整体迁入引擎/页面/API（引擎落位 `lib/core` 并抽出 service 层，看板与 MCP 共用）；org 模型 + 自有注册 + admin 多租户化；claimSeat RPC；deny-all RLS | mee7 独立项目立起来，HA7CH 成为第一个 org |
| W2 | 门规表 + llm.ts 全部 prompt 模板化（HA7CH rubric 成为内置模板一号）；落地页与 OG 管线挂 mee7.ha7ch.com；存量两场活动迁入（closed + recap），`ha7ch.com/event/*` 301 至 `mee7.ha7ch.com/e/*` | mee7 域名上线，第一天就有两场真实活动战报 |
| W3 | mee7 MCP server（service 层的薄壳：全套工具 + token 鉴权）+ 对话式建活动 + 试聊预览 | 主办方 Claude Code 接入，吃自己狗粮运营下一场 |
| W4 | 微信共享 bot 多租户化：worker 去硬编码（BRIDGE_URL、默认 event_id）、删死码、userId 统一 `{channel}:{id}` 前缀、`/admin/send` 发函多租户化、白名单直通 | MVP 验收：外部主办 30 分钟独立办一场 |
| W5+ | 签到 + 现场牵线闭环；3:4 导出卡多租户化；官方接口兜底通道调研 | V2 |

直接搬的代码：engine.ts 状态机、deriveDecision、normalizeScorecard、transcripts raw 回喂、mustWrite、配对轮询状态机、OG/导出卡管线、worker 的 iLink 传输层与并发锁。参数化重写：llm.ts 全部 prompt、store.ts 加 org scoping、worker 话术随门规走。全新：org/auth、主办 onboarding、usage 计量。

---

## 附录 A：与 Luma 的功能对照

| 环节 | Luma | mee7 |
|---|---|---|
| 参会者账号 | 需要（邮箱注册） | 零注册，微信即身份 |
| 主办操作台 | web dashboard | 自己的 Claude Code（MCP）+ web 看板 |
| 报名 | 表单（可自定义问题） | 对话（门房追问一层） |
| 审批 | 人工逐个看表单，approve/decline | AI 评分 + 三道闸自动定稿，边界态人工复核，三键改判 |
| 审批依据 | 主办肉眼 | 四维评分卡逐轮留痕，可审计 |
| 通知 | 邮件模板 | 判定与触达解耦，主办经微信统一发函，地址过闸才透露 |
| 签到 | 邮件 QR 扫码 | 发条消息即签到（V2） |
| 现场 | 无 | 牵线：筛选时学到的 problem/wants_to_meet 变成「去认识谁」（V2） |
| 被拒体验 | 拒信 | 不宣判、继续倾听、只升不降、复评可翻盘 |
| 收费 | 免费 + Plus $59/月 + 票务抽 5% | 当前免费，商业化后置，永不抽票务成 |

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
