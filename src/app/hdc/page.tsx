import type { Metadata } from "next";
import DepartmentPage from "@/components/DepartmentPage";
import AcronymTitle from "@/components/AcronymTitle";
import { hdcAncIntroduction } from "@/content/company";
import { diagnosis } from "@/content/services";

export const metadata: Metadata = {
  title: "HDC · HA7CH Deployment Company",
  description: "HDC 为企业部署 ANC——企业共同的 AI 运行层。连接业务资料、任务、权限、责任、人与 Agent，从现场诊断到部署与长期服务。",
  alternates: { canonical: "/hdc" }
};

export default function HDC() {
  return (
    <DepartmentPage title="HDC" subtitle="HA7CH Deployment Company"
      heading={<AcronymTitle />}
      introduction="我们为企业部署 ANC——企业共同的 AI 运行层。从一条真实工作流开始，连接业务资料、任务、权限、责任、人与 Agent，让日常工作积累的经验持续沉淀为知识与 Skill。"
      sectionTitle="ANC Deployment"
      items={[
        { title: "企业 ANC 部署", meta: "联系咨询", kind: "offering", href: "mailto:lawtedwu@gmail.com?subject=ANC%20Deployment", description: "围绕企业真实业务部署 ANC 架构，连接工作背景、人与 Agent 的协作、权限与结果反馈，并提供后续改造与长期服务。" },
        { title: "ANC-Diagnosis · 企业 AI 现场诊断", meta: "了解诊断", kind: "offering", href: diagnosis.href, description: diagnosis.summary },
      ]}
    >
      <section className="department-note">
        <h2 className="section-title">ANC · 企业共同的 AI 运行层</h2>
        <p>{hdcAncIntroduction}</p>
        <p>部署从组织如何积累工作背景开始：让任务、判断、反馈与结果持续留下来，按身份与项目权限供人与 Agent 使用。反复验证的做法逐步沉淀为 Skill，再延伸为工作流与业务应用。</p>
      </section>
      <section className="department-note"><h2 className="section-title">从诊断到部署</h2><p>先在现场判断业务价值与部署条件，再共同确认 ANC 的部署范围和验收标准。条件不足时，先补齐数据、系统、预算、权限与人员；价值不足时，保留判断依据，停止继续投入。具体周期与报价按项目确认。</p></section>
    </DepartmentPage>
  );
}
