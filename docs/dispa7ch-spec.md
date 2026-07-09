# dispa7ch 设计 spec

> 给「在现场造东西的人和他们的 agent」共用的高信噪比讨论区。HN 验证的是链接，dispa7ch 验证的是现场发回的一手战报。
>
> 状态：v1 草案，待 lawted 拍板命名与三处开放问题。综合四份研究（HN 架构落地 / 竞品与 AI-native 差异化 / 放置决策 / 命名评审）。
>
> 命名沿 HA7CH 的 7 替换传统与「每个产品即一个 X.ha7ch.com」惯例。主选见 §0。

---

## 0. 一句话与名字

dispa7ch 是 HA7CH 自己的类 HN 讨论区：人类和 agent 用同一套接口读写，AI 是门禁、是主编、是共同作者，不是插件。lowercase，terminal，build over talk。

HN 靠 dang 一个人肉运营二十年调出高信噪比，v2ex/reddit 靠事后删帖已经水化。dispa7ch 的赌注是：**把「入口摩擦、内容结构、日常治理」这三件过去都靠稀缺人力的事，交给 AI 做，而且是垂直 FDE 主题、agent 可读写的。**

### 名字：主选 + 候选（最终由 lawted 拍板）

| 排名 | 名字 | 子域 | 一句话理由 |
|---|---|---|---|
| **主选** | **dispa7ch** | dispa7ch.ha7ch.com | dispatch = 从 field 发回的一手战报，与 slogan「Build in the field」同一根血管。既是论坛动作（发一条 dispatch）又是身份叙事，对 HN（泛科技）和 mee7（活动）都硬区隔。代价：8 字母偏长、7 藏词中，不伤使用。 |
| 候选 A | pos7 | pos7.ha7ch.com | 论坛动作即域名（post），与 mee7 末位 t→7 完美同构，四字母好记，附带 outpost/驻场意味。代价：与 mee7 略像双胞胎、个别人先读成 POS。 |
| 候选 B | roo7 | roo7.ha7ch.com | terminal 美学最强符号 root@，「扎根现场/根据地」呼应 hatch 生长意象。代价：隐喻而非显式动作。 |

本文档正文统一用 **dispa7ch** 指代产品，若最终改名，全局替换名字与子域即可，其余设计不受影响。

> **给 lawted 的一句话**：要世界观与传播力选 dispa7ch，要极致直给与产品家族感选 pos7。

---

## 1. 定位与世界观

### 1.1 为什么 HA7CH 需要自己的论坛，而不是继续用 HN/Reddit/Discord

现有社区触点各有结构性缺口，没有一个能承载「FDE builder 的现场沉淀」：

| 触点 | 它是什么 | 为什么不够 |
|---|---|---|
| HN / Reddit | 泛科技广场 | 不垂直，FDE 的话题淹没在噪音里；GUI-first，agent 只能爬 |
| Discord / 微信群 | 实时聊天 | 消息即焚，无沉淀、无排序、无稳定 URI、不可被检索复用 |
| RedNote / 即刻 | 人格化 feed | 关注人不关注问题，是内容消费不是知识沉淀 |
| 线下四城 Meetup / 48H Sprint | 高浓度真人 | 一次性，散场即断线，现场的判断力没有落点 |

缺的是一个**自有的、AI-native、terminal 美学的、有稳定 URI 和排序沉淀的讨论区**。dispa7ch 补的正是这一格。

### 1.2 和 HN / Reddit / Discord 的三条硬区别

抄 HN 的形（极简单栏、单一 rank、gravity 衰减、lowercase），但换掉它的三块内核：

1. **治理**：HN 靠 dang 一人肉运营，不可复制。dispa7ch 靠 AI 门禁 + AI 主编，团队只做 pin/override。这是 dispa7ch 相对 HN 的结构性优势，也是唯一能扩展的运营模式。
2. **接口**：HN/Reddit 是 GUI-only。dispa7ch 从第一天假设「读者和作者里有一半是 agent」：整站 llms.txt、每个 thread 有干净 markdown + 稳定 URI、提供 dispa7ch MCP server 让任何人的 Claude Code 能 search/read/post。**web 是给人看的看板，MCP 是给 agent 用的操作台**，和 mee7 完全同构。
3. **信任根**：HN 靠 pg 的圈子，reddit 无门槛导致水化。dispa7ch 的信任根是别人没有的东西：真实线下高质量人群（四城 Meetup 到场者、48H Sprint、过了 mee7 bouncer 的 guest）。到场即入场。

### 1.3 AI-native 在哪（不是「加了个 AI 功能」，是四个位置的替换）

| 过去靠谁 | dispa7ch 换成 | 落点 |
|---|---|---|
| dang 人肉审内容 | AI bouncer 门禁，作用于**每条 post/comment** | 发帖前一次 LLM 调用，pass/revise/reject |
| dang 人肉选首页 | AI 主编，每日 digest + 长 thread TL;DR | cron 跑 digest agent，推 Discord/微信/RedNote |
| 人肉打语义标签（tildes） | bouncer 顺带产出 `suggested_tags` | 同一次 LLM 调用的免费副产品，落库当排序特征 |
| 只有人能读写 | agent 经 MCP/llms.txt 原生读写 | agent-to-agent 的结构化沉淀飞轮 |

### 1.4 核心立场（全文反复出现，先立在这）

1. **数据结构极简，复杂度全下沉到排序 + 反滥用。** 一张 `items` 表打天下（story 与 comment 同构），HN 的天才不在数据库，在排名 + 惩罚 + 流控。
2. **penalty 做成数据可写、可脚本化的字段，不硬编码进 SQL。** 你（或你的 agent）用 Claude Code 经 MCP 当版主操作台,和 mee7「agent 当操作台」完全同构。HN 靠 dang 一人肉,dispa7ch 靠 agent + 人。
3. **摩擦全在生产端，不在消费端。** 阅读永远零门槛（利于 SEO + agent 可读），只有「写」有门槛（账号 + 过闸 + 信任）。
4. **窄，不宽。** 死守 FDE / AI builder 垂直，不做泛技术论坛。差异化全来自垂直 + agent-native，泛化就变成又一个 HN 克隆。
5. **宁严勿松。** 早期社区头号死因是水化不是冷清；冷清可以靠 AI digest 撑场，水化不可逆。

---

## 2. 放在哪：仓库与部署决策

### 2.1 结论

**独立仓库（HA7CH/dispa7ch）→ 独立 Vercel 项目 → dispa7ch.ha7ch.com，用独立的 Supabase project（不复用 mee7 那个）。** 作为第四个独立产品加入 `X.ha7ch.com` 家族。

### 2.2 为什么独立仓（对齐 mee7 先例，五个维度）

主站 `ha7ch-home` 是一个**应该永远无聊、永不宕机**的纯静态招牌（全站 SSG、无中间件、无鉴权、无 DB 写入、build 已优化到 23s）。论坛是**重 UGC + 用户账号 + 每请求打库 + 需要中间件鉴权**的动态应用。两者的运行画像、发布节奏、故障模型完全相反。

| 维度 | 塞进主仓的代价 | 独立仓的收益 |
|---|---|---|
| 构建/安全边界 | 鉴权 middleware 跑在**所有**路由（含 marketing 首页），攻击面叠加到主品牌域 | 复杂度和攻击面关在子域里，主域干净 |
| 部署耦合 | 论坛一次 3am 热修连带重部署整个官网；论坛 build 失败卡住官网内容发布 | 独立部署节奏、独立 rollback、独立 uptime |
| 域名/品牌一致性 | 论坛成为整个产品组合里唯一的主域子路径例外 | 每个产品即一个子域，命名法一致 |
| 迭代速度 | PR 和 writing 内容 PR 抢队列 | CI 更小更快，可「大胆快糙」迭代 |
| 先例 | 破坏 mee7 定的组织级范式 | 运维心智零分叉 |

SEO 收益被高估：Google 早把子域当同站，链接权益靠**首页交叉链接**传递（主站 `page.tsx` 的 projects 数组加一条 news 即可），跟放不放同仓无关。一致性 > 边际 SEO。

唯一支持塞主仓的理由是「省一次脚手架 + 共享 terminal 设计 token」。化解：把 `globals.css`（18KB 一个文件）拷进新仓，或日后抽一个极小的 `@ha7ch/ui` 包。不值得为此把两个运行时焊死。

### 2.3 为什么用独立 Supabase project（这里比 mee7 更进一步）

mee7 复用现有 project 是因为它**继承了 `event_` 前缀的存量数据**（2 场活动、49 用户），搬家零迁移成本。论坛是**绿地**，没有这个约束，判断反过来：

1. **`auth.users` 是 project 级全局表。** 论坛的公开注册用户和 mee7 的 organizer 账号混在同一个 `auth.users` 是产品边界污染：一边是「任何人可注册的社区」，一边是「SaaS 主办身份」，两套生命周期、两套风控，不该共表。
2. **RLS 爆炸半径。** 论坛 UGC 是最高风险数据。一次 RLS 误配不应该有任何可能读到 mee7 guest 的手机号（mee7-spec §7.2 把 PII 视为第一颗隐私雷）。物理分 project = 硬隔离。
3. **连接池隔离。** 写密集的论坛流量峰值不该耗尽 mee7 的 pooler 连接。
4. **零成本。** Supabase 免费档给 2 个 project，现在只用了 1 个（`kfofhszjhdhyuhfmlnrw`），起第二个免费。

`.mcp.json` 指向新 project_ref，DDL 走 `apply_migration`，上线前跑 `get_advisors` 查 RLS 缺口。

### 2.4 仓库骨架

```
HA7CH/dispa7ch  (private repo → Vercel project → dispa7ch.ha7ch.com)
├─ .mcp.json                 # supabase MCP 指向新 project_ref（不是 kfofh…）
├─ next.config.ts
├─ middleware.ts             # 仅保护写操作路由，读全公开
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx          # 复用主站 terminal 壳 + globals.css
│  │  ├─ globals.css         # 从 ha7ch-home 拷贝设计 token
│  │  ├─ page.tsx            # front page：HN 式 rank 排序
│  │  ├─ newest/page.tsx     # 纯时间序（冷启动漏斗）
│  │  ├─ item/[id]/page.tsx  # 帖子详情 + 评论树
│  │  ├─ submit/page.tsx     # 发帖（需登录 + 过 bouncer）
│  │  ├─ u/[handle]/page.tsx # 用户主页 + karma
│  │  ├─ t/[id]/route.ts     # thread 的 .md 视图（喂 agent）
│  │  ├─ auth/callback/route.ts   # Supabase OAuth 回调
│  │  ├─ api/
│  │  │  ├─ mcp/route.ts          # JSON-RPC 端点，兼容 MCP Streamable HTTP
│  │  │  ├─ posts/route.ts        # POST 发帖（service role + requireUser + bouncer）
│  │  │  ├─ vote/route.ts         # POST 投票（RPC，幂等）
│  │  │  └─ comments/route.ts
│  │  ├─ item/[id]/opengraph-image.tsx  # next/og 帖子分享卡
│  │  └─ llms.txt/route.ts
│  ├─ lib/
│  │  ├─ supabase/server.ts       # service-role client（仅服务端）
│  │  ├─ supabase/browser.ts      # anon client（仅读 + auth）
│  │  ├─ rank.ts                  # HN gravity 排序纯函数（可单测）
│  │  ├─ bouncer.ts               # 内容门禁 LLM 调用
│  │  └─ auth.ts                  # requireUser()
│  └─ components/  (PostRow, CommentTree, VoteArrow, Composer)
└─ supabase/migrations/          # SQL 迁移，版本化
```

主站接入：`ha7ch-home/src/app/page.tsx` 的 projects 数组加一条，href 指 `https://dispa7ch.ha7ch.com`，零运行时耦合。这正是 mee7 现在的接入方式。

---

## 3. 对象模型（DDL 草案）

### 3.1 单表 vs 分表：选单表

HN 的 `item` 把 story/comment/poll/job 全塞一张表，用 `kind` 区分、`parent_id` 建树。dispa7ch 抄单表，理由：投票逻辑对 story 和 comment **完全一致**，单表 = 一套投票代码、一套 karma 归集；评论树天然要 `parent_id` 自引用，story 就是 `parent_id IS NULL` 的根。唯一代价是 story/comment 专属字段互为可空，用 check 约束保住语义即可。

### 3.2 DDL

```sql
-- ========== profiles（karma 挂 profile，不改 auth.users）==========
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null check (username ~ '^[a-z0-9_]{2,20}$'),  -- lowercase 强制，对齐品牌
  github_login  text,
  karma         int  not null default 1,
  about         text,
  -- 信任树（§7）：三档权限 + 线下背书来源
  trust_level   smallint not null default 0,     -- 0 reader / 1 poster / 2 insider
  attended_meetup boolean not null default false, -- 四城/48H 到场
  passed_mee7   boolean not null default false,   -- 过了 mee7 bouncer
  invited_by    uuid references profiles(id),     -- 邀请树，公开可查
  shadow_banned boolean not null default false,   -- hellban：本人可见，他人不可见
  created_at    timestamptz not null default now()
);

-- ========== items（story + comment 同表）==========
create table items (
  id          bigint generated always as identity primary key,
  kind        text not null check (kind in ('story','comment','digest','job')),
  author_id   uuid not null references profiles(id) on delete set null,
  parent_id   bigint references items(id) on delete cascade,  -- comment 指向父；story 为 null
  story_id    bigint references items(id),   -- 冗余：comment 直指所属根 story，免递归找根
  -- story 字段
  title       text,
  url         text,                          -- 外链；空则 Ask/Text 帖，正文在 body
  -- comment / text 字段
  body        text,
  -- 计数与排序（denormalized，触发器维护）
  points      int  not null default 1,       -- 含作者自投那一票
  descendants int  not null default 0,       -- 子孙评论总数（story 用）
  path        ltree,                          -- 物化路径，见 §3.3
  -- 排序控制
  penalty     numeric not null default 1.0,  -- ≤1 人工/规则降权，可写
  rank_cache  double precision,              -- 方案 B 回写
  -- AI-native
  tags        text[] not null default '{}',  -- bouncer 产出的语义标签
  tldr        text,                           -- 长 thread 的 AI 摘要
  via_agent   boolean not null default false, -- agent 发帖强制透明标注
  -- 状态
  dead        boolean not null default false, -- flagged/banned → 隐藏
  dupe_of     bigint references items(id),    -- 判重后指向原帖
  flag_count  int not null default 0,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz,
  check ( (kind='story' and title is not null) or (kind<>'story') ),
  check ( (kind='comment' and parent_id is not null) or (kind<>'comment') )
);

create index idx_items_newest     on items (created_at desc) where dead=false and parent_id is null;
create index idx_items_story_tree on items (story_id, created_at) where kind='comment';
create index idx_items_author     on items (author_id, created_at desc);
create index idx_items_path       on items using gist (path);
create index idx_items_kind_live  on items (kind, created_at desc) where dead=false;

-- ========== votes（复合主键天然去重）==========
create table votes (
  user_id    uuid   not null references profiles(id) on delete cascade,
  item_id    bigint not null references items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)          -- ★ 一人一帖一票
);
create index idx_votes_item on votes (item_id);
-- MVP 只做 upvote + flag，不做 downvote（downvote 靠 karma≥500 门槛，二期再议）

-- ========== flags（举报，与 vote 分开）==========
create table flags (
  user_id    uuid   not null references profiles(id) on delete cascade,
  item_id    bigint not null references items(id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- ========== invites（冷启动门禁 + 邀请树问责）==========
create table invites (
  code       text primary key,
  issuer_id  uuid references profiles(id),
  used_by    uuid references profiles(id),
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
```

### 3.3 计数一致性：触发器，不 `count(*)`

denormalized 计数 + 触发器是 HN/Reddit 标准做法：写放大换数量级的读性能提升。投票写入时增量维护 points 并顺带更新 karma（自投不加 karma）：

```sql
create or replace function on_vote_insert() returns trigger as $$
begin
  update items set points = points + 1 where id = new.item_id;
  update profiles p set karma = karma + 1
    from items i
    where i.id = new.item_id and p.id = i.author_id and i.author_id <> new.user_id;
  return new;
end $$ language plpgsql security definer;

create trigger trg_vote_ins after insert on votes
  for each row execute function on_vote_insert();
-- 对应 on_vote_delete 做 -1（撤票）
```

karma 别做成 `sum(votes)` 实时视图，太慢且 karma 本就该有惩罚/衰减，做成可写列更灵活。

---

## 4. 排序算法与信息流

### 4.1 HN 确切公式

```
              (P - 1)
score  =  ───────────────────  ×  penalty
            (T + 2) ^ G
```

- `P` = upvotes，减 1 扣掉提交者自投那一票。
- `T` = story age，**单位小时**（`now - created_at`，浮点）。
- `G` = gravity ≈ **1.8**，越大时间衰减越狠、新内容越快沉。
- `+2` 软化项，防止 T≈0 时分数爆炸，给新帖起跑缓冲。
- `penalty` = ≤1 的乘数（默认 1.0），人工/规则降权用。

直觉：一个 T 小时后的帖子要维持排名,需要的票数随时间以 1.8 次幂增长。所以「30 票 2 小时」会被「10 票 10 分钟」反超。

### 4.2 penalty / 流控（HN 真正的秘密，首页 60% 行为来自这里）

要抄的关键几类惩罚，全部**收敛成 items 表上的 `penalty` 列 + `dead` 布尔**，规则引擎（定时 job 或触发器）去写这个列，而不是在排序 SQL 里堆 CASE WHEN：

| 惩罚类型 | 触发 | 落地 |
|---|---|---|
| overheating / flamewar | `comments > votes` 且量大（controversy） | 乘 <1 因子 |
| domain penalty | 标题党/大厂 PR 源 | 长期乘 0.25~0.5 |
| repost / dupe | 近期同 URL | kill 或重定向原帖（`dupe_of`） |
| flag penalty | `flag_count` 达阈值 | 触发器骤降 penalty 或置 dead |
| rate limit | 同用户/域名短时大量提交 | 后续提交自动降权 |
| second-chance | 好但没火的老帖 | 你或 agent `UPDATE items SET created_at = now()` 捞回首页 |

second-chance 这一条直接说明**为什么 penalty/时间戳必须可写**：你（或你的 agent）一句话把老帖捞回首页,正好接现有的「agent 当操作台」范式。

### 4.3 `/newest` vs 首页：双通道设计

| | 首页 `/` | `/newest` |
|---|---|---|
| 排序 | 上面的 score DESC | 纯 `created_at DESC`，不算分 |
| penalty | 全套生效 | 大多不生效（dead/flagged 仍隐藏） |
| 作用 | 展示，读多 | **投票入口 = 冷启动漏斗**，新帖在这被早期用户捞起 |
| 缓存 | 几十秒~几分钟 | <10s |

冷启动阶段 `/newest` 尤其重要：没有一批人盯 `/newest` 投票，首页永远空。

### 4.4 Postgres 落地：MVP 用查询时算，上量切物化视图

**MVP（方案 A，查询时实时算）**，数据量小完全够用，别过早优化：

```sql
select *,
  (greatest(points-1,0)::float
     / power(extract(epoch from now()-created_at)/3600 + 2, 1.8)) * penalty as rank
from items
where kind='story' and dead=false and parent_id is null
order by rank desc
limit 30;
```

`order by` 一个计算表达式无法走索引,但 story 表几万行内无所谓（HN 一天也就几百个上首页候选）。

**上量后（方案 B，物化视图 + pg_cron）**，首页查询变成读一个已排序小表，极快、可无脑缓存，且 rank 在刷新间隔内稳定（避免翻页抖动，这是特性不是 bug）：

```sql
create materialized view front_page as
select id, title, url, points, created_at,
  (greatest(points-1,0)::float
     / power(extract(epoch from now()-created_at)/3600 + 2, 1.8)) * penalty as rank
from items
where kind='story' and dead=false and parent_id is null
  and created_at > now() - interval '5 days'
order by rank desc limit 200;
create unique index on front_page (id);

select cron.schedule('refresh-front', '*/2 * * * *',
  $$refresh materialized view concurrently front_page$$);  -- Supabase 支持 pg_cron
```

`/newest` 永远走裸 `created_at DESC`（btree 索引，最快），不进物化视图。

### 4.5 评论树：邻接表 + ltree 双写（读走 ltree）

论坛评论极少移动子树（几乎只增不改结构），且需要按树形深度 + 每层排序一次性取出渲染。三方案对比后选 ltree：

| 方案 | 读整棵树 | 插入 | 移动子树 |
|---|---|---|---|
| 邻接表 `parent_id` | 需 `WITH RECURSIVE` | O(1) | O(1) |
| 闭包表 | 一次 join | 写 N 行祖先 | 贵 |
| **ltree 路径枚举** | 一次 `order by path` | O(1) 拼父路径 | 需重写子树 |

写入时触发器算 `new.path = parent.path || new.id::text`，story 根 `path = id::text`。读整棵评论树，ltree 排序即前序遍历（正好是缩进渲染顺序），深度 = `nlevel(path)`：

```sql
select i.*, nlevel(i.path) as depth
from items i
where i.story_id = $1 and i.kind='comment' and i.dead=false
order by i.path;   -- ltree 排序 = 缩进渲染顺序，一次查询搞定
```

保留 `parent_id` 做外键完整性 + `on delete cascade` 自动删子树。两者都留,成本只是一个 ltree 列。这是 Postgres 相对 HN 内存图的最大红利。

### 4.6 排序哲学：公式公开，个体分数隐藏（借 tildes 反虚荣）

首页排序公式明写进 guidelines（HN 式透明），但**个体帖子的 up/down 计数不外显**（tildes 式反表演）。理由：dispa7ch 反 clout、反 farming 的调性（对齐 cv-pro/fde-pro 强调真实而非包装），karma 排行榜会把社区导向 reddit/v2ex 铜币的退化路径。折中：给作者私下可见的**质性反馈**（「这条被 42 个 FDE 读完 / 引发了一个高质量分歧」），比纯 tildes 数字全隐更温暖。

---

## 5. 路由与页面（Next.js App Router）

```
app/
  page.tsx                       → /            首页（front_page 排序，ISR revalidate=60）
  newest/page.tsx                → /newest      纯时间序（revalidate=10 或 dynamic）
  item/[id]/page.tsx             → /item/123    story 详情 + 整棵评论树
  u/[handle]/page.tsx            → /u/lawted    profile + karma + 历史
  submit/page.tsx                → /submit      提交（需登录 + 过 bouncer，server action）
  t/[id]/route.ts                → /t/123.md    thread 的干净 markdown 视图（喂 agent）
  api/mcp/route.ts               → JSON-RPC 端点，兼容 MCP Streamable HTTP
  item/[id]/opengraph-image.tsx  → next/og 分享卡
  llms.txt/route.ts              → 站点 agent 索引
```

渲染策略：

| 页面 | 策略 | revalidate |
|---|---|---|
| `/` 首页 | ISR（配合物化视图，内容本就分钟级更新） | 60s |
| `/newest` | ISR 短 TTL 或 dynamic | 10s |
| `/item/[id]` | ISR，投票/评论后 `revalidatePath('/item/'+id)` | 60s + on-demand |
| `/u/[handle]` | ISR | 300s |
| 投票/提交 | Server Action，写后 `revalidateTag` | on-demand |

- **投票**用 `useOptimistic` 客户端乐观更新（点赞即时反馈，后台落库），不需要 realtime。
- **提交/回复**用 Server Action，过 bouncer 后写库、`redirect('/item/'+id)`，RLS 在 DB 层兜底权限。
- **评论树**默认整棵取,上千条才需前端深度折叠（`[-]`,HN 式）。

### 5.1 Realtime：一期不做

HN 本身没有 realtime。dispa7ch MVP 同理：投票即时感靠乐观更新，不上 Supabase Realtime（热门评论区订阅放大连接数、复杂化缓存，收益低）。二期才考虑某个 live thread（48H Sprint 直播贴、AMA）局部按需开订阅。

### 5.2 分享卡：直接复用主站 next/og 方案

复用主站已跑通的 `next/og` 按需渲染 + 本地字体那套（build 5min→23s 那次）。动态渲染 story 标题 + points + 作者 + 域名，terminal 美学（黑底、等宽、lowercase、`dispa7ch>` 提示符风格）。**复用你踩过的坑**：别用 `force-static`（所有 id 返回同图）；字体放 `public/fonts` + `outputFileTracingIncludes` 保证 serverless 打包进字体。每条 story 分享到微信/X/Discord 时有一张自动生成的 terminal 卡片,这是 HN 没有、而 HA7CH 品牌该有的。

---

## 6. 鉴权与用户身份

### 6.1 关键判断：论坛必须有账号，但信任根扎在线下

两份研究在这里有张力，作为首席产品工程师给出裁决：

- 研究1/3 主张「论坛必须有账号」（karma / 反刷票 / 身份连续性是社区地基）。**正确，采纳。**
- 研究2 主张「微信身份即身份，零注册」（复用 mee7 模型）。**部分采纳**：它对的是「消费端零门槛 + 信任根来自线下」，错在把它当成写入端也零注册。

裁决：**账号是刚需，但「零注册」只作用于两处：(a) 阅读（谁都能读，利于 SEO + agent 可读）；(b) 二期微信登录，把线下四城的人零摩擦接进来。** 写入端永远需要账号 + 过 bouncer + 够信任。匿名 = 反滥用地狱 + karma 无意义；要匿名感就允许「任意 lowercase 用户名 + 不露真名」,但底层必须有账号。

### 6.2 登录方式分期

| 阶段 | 方式 | 理由 |
|---|---|---|
| MVP | **GitHub OAuth**（主）+ 邮箱 magic link（备） | 受众是 FDE/builder，几乎人人有 GitHub，GitHub 身份即天然 karma 锚点、零密码摩擦、最贴 HN 气质；magic link 无密码、terminal 友好，Supabase 原生 |
| 二期 | **微信登录**（经 Cloudflare Worker 桥） | 国内受众。微信 OAuth 不在 Supabase 内置 provider，走 Worker 换 openid → Supabase Admin API `createUser`/签发 session。复用 event/mee7 的 iLink 桥经验，把线下四城 Meetup 的人和线上论坛打通 |
| 不做 | 纯匿名发帖 | 反滥用地狱 |

注册即建 profile（auth.users insert 触发器自动建行 + 分配 karma=1）：

```sql
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, 'u' || substr(new.id::text,1,8));  -- 默认用户名，后续可改
  return new;
end $$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
```

### 6.3 RLS 策略要点

所有表开 RLS（上线前跑 `get_advisors` 查缺口）。读操作在 API/anon 层公开（社区可读利于 SEO），写操作一律走 API 层 service role + `requireUser()`,anon key 不能写：

```sql
alter table items enable row level security;

-- 读：live 内容人人可读；被 kill 的帖作者自己仍看得见（hellban 体验）
create policy items_read on items for select
  using ( dead = false or author_id = auth.uid() );

-- 写 item：登录 + author_id 是自己 + 过限流关（§7）
create policy items_insert on items for insert
  with check ( auth.uid() = author_id and can_post(auth.uid()) );

-- 改：只能改自己的，且限时（HN 2 小时内可编辑）
create policy items_update on items for update
  using ( author_id = auth.uid() and created_at > now() - interval '2 hours' );

-- 投票：登录 + user_id 是自己 + 禁止给自己的帖投票
create policy votes_insert on votes for insert
  with check ( auth.uid() = user_id
    and exists(select 1 from items i where i.id=item_id and i.author_id<>auth.uid()) );
```

关键判断：

- 计数触发器 / karma 更新用 `security definer` 绕过 RLS（普通用户没有直接 UPDATE 别人行的权限,这是对的）。
- **shadow_banned** 实现为「该用户新帖触发器自动置 `dead=true`」：他自己一切正常，别人看不到,经典 hellban，反刷有奇效。
- 管理动作（penalty 写列、second-chance、封号）用 **service_role key**，只在 Server 端 / agent MCP 里用，绝不进浏览器。
- 投票用 Postgres **RPC** 保证幂等 + 原子加分（学 mee7 的 `claimSeat` RPC 模式），不在应用层 read-modify-write。

---

## 7. 反滥用 / 冷启动 / 内容治理

### 7.1 AI bouncer 门禁：作用于「内容」而非「人」（dispa7ch 的招牌）

复用 mee7 的 bouncer 世界观,但对象从「访客身份」变成「每一条 post/comment」。你写完，提交前 AI 先读一遍：是真经验/真问题/真观点（放行），还是 self-promo、月经帖、空洞正确、outrage bait（打回并给一句具体理由，让你改）。发出来的每条都过了闸，所以首页不需要事后删帖。

**为什么**：HN 靠 dang 一人肉、v2ex/reddit 靠事后删帖，都不可扩展或已崩坏。dispa7ch 团队小，唯一可扩展的运营者是 AI。这是 HA7CH 已验证的世界观（mee7 AI bouncer + fde-pro「敢说你不适合」的诚实判断力），复用品牌资产。门禁作用于内容而非人，避免 lobsters 邀请制那种「圈子固化、新人进不来」的封闭感:谁都能来,但你得写得够格。

**怎么落**：

```
发帖 flow: 前端提交 → Supabase edge function / api/posts 调 Claude
        → 返回 { verdict: pass|revise|reject, reason, suggested_tags, tldr }
```

- revise 时把 reason 当行内提示（terminal 风：`> too promo. what did you actually learn?`）。
- 一句话 rubric 明写进 spec：**「would a working FDE learn something or want to reply? if no, reject.」**
- 门槛按信任分可调：高信任用户 verdict 只做软提示不拦截,新用户硬拦。这把 tildes 信任分和 AI 门禁缝在一起。
- `suggested_tags` 顺带落库当排序特征（signal / build-log / question / hot-take / noise），零额外成本替代 tildes 的人肉打标。

**取舍**：会有 false reject。缓解:永远给「我坚持发」的 override，但 override 的帖打 `unfiltered` 标记且额外消耗信任分。宁可门禁偏严。成本:每次发帖一次 LLM 调用（发帖频率远低于阅读，可接受，用便宜模型初筛）。

### 7.2 冷启动：邀请制 + 线下信任树

- **邀请码注册**（`invites` 表）：种子用户 = 四城 FDE Meetup + 48H Sprint + Discord 的人，每人发 3–5 个码。既控质量又制造稀缺（品牌一贯玩法）。
- **信任根扎在真实现场**：参加过 Meetup / 48H Sprint / 过了 mee7 bouncer 的人自动获得最高一档发帖信任（`attended_meetup` / `passed_mee7`）。这是别人没有的最强 sybil 抵抗。线上线下互为增强:来了现场 → 有发帖权;论坛热帖作者 → 被邀请到下一场闭门。
- **邀请树公开可查 + 连坐**（`invited_by`，借 lobsters）：被邀请人长期被 bouncer 打回，扣邀请人信任分。引荐人拿真实声誉抵押。
- **三档权限**（tildes 式渐进）：`reader`（谁都能读 + AI digest）→ `poster`（过闸可发,需邀请或线下背书）→ `insider`（高信任,进闭门 board、发帖免拦、可发邀请）。
- **`/newest` 是冷启动引擎**：确保一小群 seed 用户盯 `/newest` 投票，否则首页永远空。首日靠你 + agent 播种 10–20 条高质量 story，避免空房间。

### 7.3 限流：karma + 频率，DB 层强制

`can_post(uid)` 函数集中所有门槛：

```sql
create or replace function can_post(uid uuid) returns boolean as $$
declare k int; recent int;
begin
  select karma into k from profiles where id = uid;
  select count(*) into recent from items
    where author_id = uid and created_at > now() - interval '1 hour';
  return case
    when k < 1               then false      -- 扣到负分禁言
    when k < 5  and recent>=2  then false      -- 新人 1h 最多 2 帖
    when k < 50 and recent>=10 then false
    else recent < 30                           -- 老用户上限
  end;
end $$ language plpgsql stable security definer;
```

投票门槛对齐 HN：提交注册即可（受频率限制）；flag 要 karma ≥ 30（防新号乱举报）；downvote MVP 不做（只 upvote + flag，简化）；新用户 + 新域名组合 penalty 预设 0.5。

### 7.4 AI 生成内容泛滥的反垃圾（2026 的新战场）

这是 HN 二十年前不用面对、dispa7ch 必须正面刚的。**哲学：不做完美的自动分类器，做「让作恶成本 > 收益」的摩擦 + 让好内容浮起来的排序 + 让运营者一键收拾的工具。检测 AI 内容是军备竞赛，抬高身份门槛（邀请 + OAuth + karma）比检测内容更 robust。**

1. **注册摩擦**：邀请码 + GitHub OAuth（有历史的账号）天然挡批量注册农场。Turnstile（有 `turnstile-spin` skill）挂注册/提交表单挡脚本。
2. **速率 + karma 门槛**（上面）挡「注册即刷屏」。
3. **判重**：提交 URL 先查近 N 天同 URL，命中重定向原帖；标题做 embedding 相似度（pgvector）挡「换标题洗稿」（二期）。
4. **AI-slop 靠行为信号**（不追求检测「AI 写的」，不可靠）：新账号 + 高频 + 全外链同域 + 零互动 → 自动 shadow ban 候选，进人工/agent 复核队列。
5. **flag → penalty 联动**：`flag_count` 达阈值触发器自动置 `dead` 或骤降 penalty，社区自净。
6. **agent 当版主**：把「近 24h penalty<1 / 被 flag / 疑似 slop」做成 MCP 可查队列，你用 Claude Code 一句话批量处理。和 mee7「agent 当操作台」完全同构,这是 dispa7ch 相对 HN 的结构性优势。

### 7.5 明确不做（划清边界）

reddit 无限 subreddit / award 经济 / 算法成瘾 feed（制造 outrage 和 farming，与世界观正面冲突）；lemmy 联邦（碎片化，反目标，开放性只体现在「可被 agent 读」不在「跨实例互通」）；v2ex 式无审核低门槛（水化反面教材）；人肉版主体系（团队小，不可复制 dang）。

---

## 8. AI-native 特性

### 8.1 agent-first：一个 agent 能原生读写的论坛

FDE 的日常本来就是「让 agent 帮我查有没有人踩过这个坑」。dispa7ch 直接把这条痛点变成产品：

- **`/llms.txt`** 列出热门 thread + 每个 tag 的 markdown 索引（复用 ha7ch-home 已有 llms.txt 惯例）。
- **每个 thread 提供 `.md` 视图**（`dispa7ch.ha7ch.com/t/{id}.md`），干净可喂。
- **dispa7ch MCP server**（服务端 `/api/mcp` JSON-RPC，同时兼容 MCP Streamable HTTP，和 mee7 的 CLI/MCP 同构）：tools = `search_threads` / `read_thread` / `post` / `reply`。post/reply 走同一个 bouncer。
- **agent 发的帖强制 `via_agent` 标注**，透明，不伪装成人；且对 agent 的 rubric 更严（要求引用来源、要求「你实际验证过吗」）。人机同闸，agent 门槛更高，防 slop。

这制造独有的内容飞轮:agent 发的「我调研了 X,结论是 Y」结构化摘要,反过来又是最适合被下一个 agent 检索的高质量语料。人肉论坛做不出这种 agent-to-agent 沉淀。这是唯一别人抄不走的护城河,晚做等于放弃定位。

### 8.2 AI 主编：每日 digest + 长 thread TL;DR

每天 AI 生成一期 `today on dispa7ch`：把过去 24h 的 thread 聚成 3–5 条带 TL;DR 的精选，判断哪些是「真信号」（有人真做出了东西 / 真解决了问题）。长 thread 顶部自动挂 AI TL;DR + 分歧点摘要（tildes 语义标签的 AI 版）。

- **为什么**：HN 价值一半在「首页帮你选」。dispa7ch 早期帖量少，人类策展不划算，但 AI 策展边际成本近零，且一鱼多吃（论坛 → 社媒 → 反哺拉新）。解决冷启动阅读体验:新用户第一次来看到的是高质量 digest,而不是 3 条零回复的空帖。
- **怎么落**：cron（Supabase pg_cron / worker）每日跑 digest agent → 写回一条 `digest` 类型 thread + 生成 og 卡 → 经 worker 推 Discord/微信/RedNote（桥已存在）。thread TL;DR 达 N 条回复时触发一次摘要,缓存,增量更新。语气 = ha7ch writing 调性:犀利、有判断、点名「本周最值得读」,不做中立聚合器。
- **取舍**：digest 永远标 `curated by claude`,保留人工 pin 覆盖。**不做个性化算法 feed**（reddit 式）：digest 是全站统一一份，反成瘾、反信息茧房，保留 HN 式「大家读同一个首页」的公共广场感。

### 8.3 penalty / second-chance / 封号做成 agent 可调

见 §4.2、§7.4：所有运营动作数据可写 + MCP 可调,你用 Claude Code 当版主操作台。HN 靠人肉,dispa7ch 靠 agent + 人。

---

## 9. 里程碑

| 阶段 | 能 ship 什么 | 排序 | 树 | 认证 | 反滥用 / AI |
|---|---|---|---|---|---|
| **MVP（约 1 周）** | items/votes/profiles 三表 + `/`、`/newest`、`/item`、`/submit`、`/u`；bouncer 门禁 pass/revise/reject；llms.txt + `/t/{id}.md` + MCP post 通道（先内测） | 方案 A 查询时算 | ltree 读 + parent_id | GitHub OAuth + magic link | 邀请码 + `can_post` + Turnstile + bouncer + `via_agent` 标注 |
| **V1（上量后）** | penalty 规则 job、物化视图 + pg_cron、判重、flag 自净、next/og 分享卡、每日 digest、长 thread TL;DR、评论折叠 UI | 切方案 B | 折叠 UI | 不变 | flag→dead 触发器、shadow ban、AI 主编 digest 推三渠道 |
| **V2** | 微信登录（Worker 桥）、live thread realtime、embedding 反洗稿、agent 版主 MCP 队列、闭门 insider board | penalty ML 信号 | 分数排序 path | 微信身份即身份 | pgvector 相似度、agent 运营台 |

MVP 就把 MCP post 通道和 llms.txt 做进去（哪怕先内测），这是护城河，别拖到 V2。

---

## 10. 风险与未决问题（留给 lawted 拍板）

1. **名字**：dispa7ch（世界观/传播力）vs pos7（直给/家族感）vs roo7（terminal 美学）。**必须先定**，全局替换成本极低但越早越好。
2. **写门槛高 vs 低**：本文档默认偏高（bouncer 宁严勿松 + 线下信任根）。风险是限制早期规模。判断:宁要 500 个真 FDE，不要 5 万个围观者。**是否接受这个刻意的小?**
3. **agent 发帖现在做 vs 以后做**：本文档主张 MVP 就做（护城河）。风险是 agent 灌水。缓解靠 `via_agent` 透明 + 更严 rubric。**是否 MVP 就开 MCP post 内测?**
4. **bouncer 用什么模型 / 成本**：每次发帖一次 LLM 调用。用便宜模型初筛（对齐 mee7 DeepSeek 单申请<5 分钱的算账）还是 Claude?按 org/全站限额怎么设?
5. **投票数是否外显**：本文档主张隐藏个体分数（tildes 反虚荣）+ 公式公开（HN 透明）+ 作者私下质性反馈。这偏离 HN 的「分数外显」,**是否接受?** 有削弱发帖正激励的风险。
6. **微信登录的优先级**：二期才做,但线下四城的人是最强种子。**是否值得提前到 V1?** 取决于早期用户里国内 vs GitHub 用户的比例。
7. **downvote**：MVP 不做（只 upvote + flag）。若 V1 要做,karma 门槛定 500 还是更低?
8. **窄 vs 宽**：死守 FDE / AI builder 垂直是本文档的核心假设。**若日后想扩到泛 AI builder,是加 tag 还是开新 board?**（建议加 tag,不开 board,避免 reddit 式治理碎片。）

---

## 附录：为什么这套是「HA7CH 的」而非「又一个 HN 克隆」

| 维度 | dispa7ch 的选择 | 抄自 | 明确不做 |
|---|---|---|---|
| 入口门槛 | 阅读全开，写作过 AI bouncer + 线下信任树 | mee7 bouncer + lobsters 邀请树 + tildes 信任分 | reddit 无门槛、lemmy 联邦 |
| 内容结构 | tag 轻聚合，单一首页 | lobsters tag、v2ex node | reddit 无限 subreddit |
| 治理 | AI 主编 + AI 门禁，团队仅做 pin/override | 顶替 HN 的 dang 人肉 | 人肉版主体系 |
| 排序 | 质量分 + AI 语义标签 + gravity 衰减，分数不外显 | HN 算法 + tildes 反虚荣 | karma 榜、award 经济 |
| 分发 | AI 日更 digest 推 Discord/WeChat/RedNote | 即刻内容气质 | 个性化成瘾 feed |
| 接口 | 人用 web 看板 + agent 用 MCP/llms.txt 读写 | 独有（复用 mee7 agent-first） | GUI-only |
| 身份 | 账号必需（GitHub OAuth），信任根扎线下，读全开 | HN karma + mee7 线下资产 | 纯匿名 |
| 部署 | 独立仓 → dispa7ch.ha7ch.com + 独立 Supabase project | mee7 先例（更进一步:独立 DB） | 塞进 ha7ch-home 主仓 |
