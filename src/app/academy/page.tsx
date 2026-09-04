import type { Metadata } from "next";
import DepartmentPage from "@/components/DepartmentPage";
import { executiveCamp } from "@/content/services";

export const metadata: Metadata = {
  title: "HA7CH Academy",
  description: "从 Agent 带学到企业现场实战。了解 HA7CH School、FDE Camp 与老板 AI 战略营。",
  alternates: { canonical: "/academy" }
};

export default function Academy() {
  return (
    <DepartmentPage
      title="HA7CH Academy"
      subtitle="Education · 企业 AI 转型教育"
      introduction="从理解 AI Native 的工作方式，到进入企业现场完成交付。Academy 为 FDE、Builder 和企业负责人提供带学、实战训练与企业内训。"
      sectionTitle="Learn & build"
      items={[
        {
          group: "School", title: "HA7CH School", meta: "GitHub ↗", kind: "offering",
          description: "加载即入学的 Agent 导师。在自己的 Codex 或 Claude Code 中学习 AI Native 与 FDE，结合真实资料和产品练习，按你的理解与进度继续带学。",
          href: "https://github.com/HA7CH/ha7ch-school"
        },
        {
          group: "Camp", title: "FDE Camp", meta: "GitHub ↗", kind: "offering",
          description: "面向已有 AI 构建或客户沟通基础的 FDE 与 Builder。学习企业判断、ANC 架构和现场交付，通过真实案例与 Whiteboard Interview 检验能力。仓库里的 Skill 可以讲清课程、适合人群与报名方式。",
          href: "https://github.com/HA7CH/anc-fde-camp"
        },
        {
          group: "Leadership", title: executiveCamp.title, meta: "了解课程", kind: "offering",
          description: "两天，判断未来，重构公司。59,800 RMB / 家企业，老板与核心执行负责人双席位。带走初步诊断、组织调整建议和 90 天行动计划。",
          href: executiveCamp.href
        }
      ]}
    >
      <section id="executive-ai-camp" className="department-note">
        <h2 className="section-title">For enterprise leaders</h2>
        <p>老板 AI 战略营在深圳开展，小班制、申请制。具体开班日期与席位向团队确认。企业也可以咨询围绕真实业务问题的定制内训。</p>
      </section>
    </DepartmentPage>
  );
}
