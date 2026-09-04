// Editorial source: two sets of four product posters supplied by the user on 2026-09-05.
// Public GitHub repositories verified after publication on 2026-09-05.
export type Service = {
  title: string;
  department: string;
  parentHref: string;
  href: string;
  subtitle: string;
  introduction: string;
  summary: string;
  skill: string;
  github: string | null;
  contactNote: string;
  plans: { title: string; meta: string; description: string }[];
  sections: { title: string; intro?: string; items: { title: string; description: string }[] }[];
  disclosure: string;
};

export const diagnosis: Service = {
  title: "ANC-Diagnosis",
  department: "HDC",
  parentHref: "/hdc",
  href: "/hdc/diagnosis",
  subtitle: "HDC · 企业 AI 现场诊断",
  introduction: "先看清企业真正需要什么，再决定 AI 应该怎样进入公司。先看完整家公司，再解决老板最关心的问题。",
  summary: "HDC 团队进入企业现场，从老板到一线，用真实业务资料验证关键工作流。五个工作日，带回一面企业 AI 全景图和一点真实 Demo。",
  skill: "anc-diagnosis",
  github: "https://github.com/HA7CH/anc-diagnosis",
  contactNote: "HDC Diagnosis",
  plans: [
    { title: "AI 落地可行性诊断", meta: "80,000 RMB 起", description: "5 个工作日。适合已有明确、急需解决的业务问题。团队进入现场判断 AI 落地可行性，用真实业务资料做出 Demo，向管理层演示。" },
    { title: "行业战略联合诊断", meta: "298,000 RMB 起", description: "5 个工作日。适合仍需决定企业应该优先押注什么。包含完整落地诊断与 Demo，增加企业 AI 战略、业务优先级、组织与人才调整，以及整体部署路线。" }
  ],
  sections: [
    { title: "一点一面", intro: "老板最终看到：一面全景图 + 一点真实 Demo。知道企业怎样使用 AI，也能决定下一步怎样投入。", items: [
      { title: "从老板到一线", description: "对齐经营目标，访谈业务负责人，了解真实工作、资料、系统、重复劳动与错误。" },
      { title: "企业 AI 全景图", description: "看清 AI 应该先用在哪里，数据与权限缺什么，人和 Agent 怎么分工，项目如何立项、验收与复盘。" },
      { title: "真实工作流 Demo", description: "选一条关键工作路径，用获授权、脱敏的真实资料边做边验证。演示 AI 怎样完成工作、哪里需要人检查，以及最后产生什么结果。" }
    ] },
    { title: "五天在现场", items: [
      { title: "Day 01 · 和老板对齐", description: "经营目标、最急问题、当前 AI 投入与最终判断标准。明确想改变什么、Demo 要回答什么。" },
      { title: "Day 02 · 访谈业务负责人", description: "梳理业务线、核心项目、管理难点与当前系统，找出影响经营结果、值得优先尝试的工作。" },
      { title: "Day 03 · 进入一线环境", description: "观察真实工作、收集脱敏资料、查看数据与权限。看清任务在哪等待、怎样出错、由谁负责。" },
      { title: "Day 04 · 驻场制作 Demo", description: "把真实输入、Agent 步骤与人工检查点串起来，和负责人、一线员工反复确认与调整。" },
      { title: "Day 05 · 向管理层演示", description: "带着 Demo、企业 AI 全景图、组织建议和下一步路线回到管理层，支持下一步投入判断。" }
    ] },
    { title: "下一步，由结果决定", items: [
      { title: "GO · 进入 ANC Deployment", description: "价值、工作流、负责人和验收方式已经清楚。进一步确认正式部署的范围与责任。" },
      { title: "HOLD · 补齐条件后再决定", description: "先解决数据、系统、预算、权限或人员问题。" },
      { title: "NO-GO · 暂不进入 Deployment", description: "当前价值不足，停止继续投入并保留判断依据。" }
    ] },
    { title: "从一片叶子，到企业的树干", intro: "Diagnosis 验证一片叶子。ANC Deployment 建起企业的树干。", items: [
      { title: "把真实工作流正式接入企业", description: "连接老板目标、公司资料、任务、权限、责任、决策和结果。真实任务持续进入，Agent 执行，人在关键节点负责，结果留下证据。" }
    ] }
  ],
  disclosure: "报价与范围以双方确认的工作说明书及合同为准。排期另行确认；Demo 不等于生产部署，后续 ANC Deployment 单独确认。"
};

export const executiveCamp: Service = {
  title: "老板 AI 战略营",
  department: "HA7CH Academy",
  parentHref: "/academy",
  href: "/academy/executive-ai-camp",
  subtitle: "HA7CH Academy · 企业老板 / CEO",
  introduction: "判断未来，重构公司。两天，只解决老板最关心的两件事：看清 AI 正在把生意带向哪里；决定组织、岗位与人才怎么调整。",
  summary: "老板与核心执行负责人一起，从真实公司问题出发，形成初步诊断、组织与人才调整建议，以及首个工作流和 90 天行动计划。",
  skill: "anc-executive-camp",
  github: "https://github.com/HA7CH/anc-executive-camp",
  contactNote: "老板 AI 战略营",
  plans: [
    { title: "每家企业 · 双席位", meta: "59,800 RMB", description: "1 位最终决策人 + 1 位核心执行负责人。两天、小班制、申请制、深圳。带着公司问题来，带着初步诊断与落地计划回去。" }
  ],
  sections: [
    { title: "第一天 · 看懂自己的公司", intro: "上午，老板先亲自用。下午，开始拆自己的公司。", items: [
      { title: "老板个人 AI 提效", description: "搭出个人 AI 工作台，亲自理解它能做什么、不能做什么。" },
      { title: "拆解行业脱敏案例", description: "看别人真正卡在哪里、试错了什么，最后验证了什么。" },
      { title: "一对一初步诊断", description: "找出公司最卡的三件事，梳理 AI 机会清单，判断哪些能解决、哪些暂时不能、应该先做什么。" }
    ] },
    { title: "第二天 · 把判断变成行动", items: [
      { title: "判断未来形势", description: "讨论未来三年 AI 对收入、成本、交付与竞争边界的影响，形成公司初步诊断。" },
      { title: "选择技术与部署路线", description: "本地、云或混合；用什么模型，数据与权限放在哪里。" },
      { title: "重画组织架构", description: "岗位怎样变，人与 Agent 怎样分工，责任与权限如何重新安排，关键人才还缺什么。" },
      { title: "排出 90 天行动计划", description: "明确首个工作流、优先级、决策人与执行负责人、验证标准和推进节奏。" }
    ] },
    { title: "两天带走什么", items: [
      { title: "行业案例拆解包", description: "与你行业相关的脱敏案例，以及已经踩过的坑。" },
      { title: "老板个人 AI 工作台", description: "覆盖研究、决策、会议、沟通、跟进与长期记忆。" },
      { title: "公司 AI 初步诊断", description: "当前卡点，哪些能解决、哪些暂时不能。" },
      { title: "模型与部署建议", description: "本地、云或混合的技术路线，以及模型、数据与权限边界。" },
      { title: "组织与人才调整图", description: "岗位变化、人机分工、关键人才与能力缺口。" },
      { title: "公司 AI 落地计划", description: "首个工作流、90 天行动、老板与执行负责人分工。" }
    ] },
    { title: "回公司，继续推进", items: [
      { title: "30 天推进与复盘", description: "持续跟进执行问题，30 天后复盘。围绕部署路线、模型选择、数据权限与首个场景推进。" },
      { title: "12 个月案例与趋势更新", description: "持续更新企业 AI 案例与趋势，建立公司 AI 转型档案。" }
    ] }
  ],
  disclosure: "具体开班日期、场地、席位与商业条款向团队确认。后续支持按约定范围开展；初步诊断和行动计划不等于已完成现场诊断或生产部署。"
};
