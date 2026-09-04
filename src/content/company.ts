// Public copy checked against HA7CH/anc-ha7ch-v2 at ae090c292d89225106eaf4fc61da325ea0d7429d.
// Sources: company/README.md, glossary.md, departments/*.md and offerings/*.md.
// Diagnosis and executive camp updated from user-supplied service posters on 2026-09-05.
import { diagnosis, executiveCamp } from "./services";
export const company = {
  updatedAt: "2026-09-05",
  title: "HA7CH · 孵化全球第一批 AI Native Company",
  tagline: "和 HA7CH 一起，孵化全球第一批 AI Native Company。",
  description:
    "和 HA7CH 一起，孵化全球第一批 AI Native Company。通过 HCN、HDC、HA7CH Academy 和 ANC Fund，开展内容共创、企业部署、实战教育与投资孵化。"
};

export const hdcAncIntroduction =
  "ANC 是企业共同的 AI 运行层，连接业务资料、工作背景、项目、任务、权限、责任、人与 Agent。让不同业务应用共用一套底座，让每次执行、确认与反馈都成为下一次工作的基础。";

export const departments = [
  {
    group: "Content",
    title: "HCN",
    href: "/hcn",
    description:
      "HA7CH Creator Network。连接长期分享 AI 的创作者，提供一手信息、选题共创、内容分发与品牌合作机会。创作者保留自己的判断与表达。",
    meta: "创作者网络",
    kind: "department" as const
  },
  {
    group: "Deployment",
    title: "HDC",
    href: "/hdc",
    description:
      "HA7CH Deployment Company。为企业部署 ANC——企业共同的 AI 运行层。连接任务、知识、权限与 Agent，从真实工作流开始，持续沉淀可复用的知识与 Skill。",
    meta: "ANC 部署",
    kind: "department" as const
  },
  {
    group: "Education",
    title: "HA7CH Academy",
    href: "/academy",
    description:
      "面向 FDE、Builder、企业老板与业务负责人。通过 Camp、企业内训和真实项目，训练企业判断、AI 战略与现场交付能力。",
    meta: "实战教育",
    kind: "department" as const
  },
  {
    group: "Investment",
    title: "ANC Fund",
    href: "/anc-fund",
    description:
      "AI Native Company 投资与孵化计划。关注经过真实业务验证的企业、FDE 项目与 AI Native 创业公司，探索资本、FDE 和 ANC 能力的共同投入。当前处于发起与合作阶段。",
    meta: "投资孵化",
    kind: "department" as const
  }
];

export const offerings = [
  {
    group: "Enterprise",
    title: "ANC Deployment · 企业 ANC 部署",
    href: "/hdc",
    description:
      "由 HDC 进入企业现场，先诊断业务与部署条件，再围绕真实工作流部署 ANC，连接企业的 Context、权限与协作，让人与 Agent 在共同的运行层上工作。",
    meta: "企业负责人",
    kind: "offering" as const
  },
  {
    group: "Diagnosis",
    title: "ANC-Diagnosis · 企业 AI 现场诊断",
    href: diagnosis.href,
    description: diagnosis.summary,
    meta: "5 个工作日",
    kind: "offering" as const
  },
  {
    group: "FDE",
    title: "FDE Camp",
    href: "https://github.com/HA7CH/anc-fde-camp",
    description:
      "先看懂企业，再设计 AI 组织架构。围绕五类真实企业案例，学习 AI 战略、ANC 架构与现场交付，让方法经得起实际业务检验。",
    meta: "FDE / Builder",
    kind: "offering" as const
  },
  {
    group: "Leadership",
    title: "老板 AI 战略营",
    href: executiveCamp.href,
    description:
      "两天，判断未来，重构公司。老板与核心执行负责人一起，带走公司 AI 初步诊断、组织与人才调整建议，以及首个工作流和 90 天行动计划。",
    meta: "老板 / CEO",
    kind: "offering" as const
  }
];

export function companyMarkdown() {
  return [
    `## HA7CH\n\n${company.tagline}`,
    `## Departments\n\n${departments.map((item) => `- ${item.title}: ${item.description}${item.title === "HDC" ? `\n  ${hdcAncIntroduction}` : ""}`).join("\n")}`,
    `## Work with us\n\n${offerings.map((item) => `- ${item.title}: ${item.description}\n  ${item.href.startsWith("/") ? `https://ha7ch.com${item.href}` : item.href}`).join("\n")}`,
    ...[diagnosis, executiveCamp].map((service) => `## ${service.title}\n\n${service.summary}\n\n${service.plans.map((plan) => `- ${plan.title}: ${plan.meta}。${plan.description}`).join("\n")}\n\n${service.disclosure}`)
  ].join("\n\n");
}
