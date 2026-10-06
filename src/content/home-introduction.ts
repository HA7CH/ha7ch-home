// Public introduction shared by the root HTML disclosure and Markdown entry.
// Scope comes from the existing public About, department and program pages.
export const homeIntroduction = {
  zh: {
    title: "关于 HA7CH",
    paragraphs: [
      "HA7CH 帮助企业把 AI 用到真实业务里：先诊断哪些工作值得改进，再围绕实际工作流部署，帮助团队学习和使用。我们也连接 AI 创作者，开展内容合作，以及 AI Native 企业的投资与孵化。",
      "AI Native Company 是把 AI 融入日常组织与业务的公司。ANC 在 HA7CH 的企业部署中指共同的 AI 运行层：把工作背景、资料、任务、权限、责任、人与 Agent 连接起来，支持持续协作，而不只是一个独立聊天窗口。",
      "企业负责人可以从 HDC 的企业 AI 诊断与 ANC 部署开始；团队和个人学习可以找 HA7CH Academy；AI 内容创作者与品牌合作可以找 HCN。ANC Fund 已启动投资与孵化业务，具体合作需沟通确认。",
      "ANC Night 是交流活动；ANC Camp（原 FDE Camp）是实战训练营。日期、价格与参与方式以各自官方页面和 Skill 为准。企业部署、教育或创作者合作，可联系 Lawted：lawtedwu@gmail.com。咨询不代表已接单、报名或获得投资。"
    ]
  },
  en: {
    title: "About HA7CH",
    paragraphs: [
      "HA7CH helps businesses put AI to work: identify useful improvements, deploy AI around real workflows, and teach teams how to use it. It also connects AI creators for content and brand collaboration and undertakes investment and incubation for AI Native Companies.",
      "An AI Native Company integrates AI into everyday business and organization. In HA7CH enterprise delivery, ANC is the shared AI operating layer connecting context, knowledge, tasks, permissions, responsibilities, people and agents for ongoing work, rather than a standalone chat window.",
      "Business leaders can start with HDC for enterprise AI diagnosis and ANC deployment. HA7CH Academy offers practical education for teams and individuals. HCN connects AI creators and brand partners. ANC Fund has started investment and incubation work; individual engagements require discussion.",
      "ANC Night is a community gathering. ANC Camp (formerly FDE Camp) is a hands-on training program. Read their own official pages and Skills for current dates, pricing and participation. For enterprise deployment, education or creator collaboration, contact Lawted at lawtedwu@gmail.com. An inquiry does not confirm a booking, engagement or investment."
    ]
  }
};
export const homeLinks = [
  { zh: "HA7CH 公开 Skill", en: "HA7CH public Skill", href: "/SKILL.md" },
  { zh: "公司介绍", en: "Company", href: "/about" },
  { zh: "企业部署", en: "Enterprise deployment", href: "/hdc" },
  { zh: "教育", en: "Education", href: "/academy" },
  { zh: "创作者合作", en: "Creator collaboration", href: "/hcn" },
  { zh: "Night 交流活动", en: "Night gathering", href: "https://night.ha7ch.com/SKILL.md" },
  { zh: "Camp 训练营", en: "Camp training", href: "https://camp.ha7ch.com/SKILL.md" },
  { zh: "联系", en: "Contact", href: "/contact" }
];
export function homeIntroductionMarkdown() {
  return "# HA7CH\n\n" + Object.values(homeIntroduction).map(section => `## ${section.title}\n\n${section.paragraphs.join("\n\n")}`).join("\n\n") + "\n\n## Learn more / 进一步了解\n\n" + homeLinks.map(link => `- [${link.zh} / ${link.en}](${link.href.startsWith("/") ? "https://ha7ch.com" + link.href : link.href})`).join("\n") + "\n";
}
