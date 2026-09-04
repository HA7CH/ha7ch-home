import type { Metadata } from "next";
import DepartmentPage from "@/components/DepartmentPage";
import { registrationItem } from "@/content/catalog";

export const metadata: Metadata = {
  title: "ANC Fund · 企业发现与投资孵化",
  description: "关注真实业务中的企业与 FDE 项目。了解 ANC Fund S26 企业发现计划，通过 mee7 提交申请。",
  alternates: { canonical: "/anc-fund" }
};

export default function ANCFund() {
  return (
    <DepartmentPage title="ANC Fund" subtitle="AI Native Company · 投资与孵化计划"
      introduction="从真实业务中发现值得长期建设的企业与项目。ANC Fund 关注优质企业、FDE 项目和 AI Native 创业公司，探索资本、FDE 现场能力与 ANC 部署的共同投入。"
      sectionTitle="Apply for S26"
      items={[registrationItem("anc-fund-s26")]}
    >
      <section className="department-note"><h2 className="section-title">From the field</h2><p>带着你的企业、正在推进的 FDE 项目或创业方向来。通过 mee7 说明真实业务、当前进展和希望获得的支持，后续合作以具体项目沟通为准。</p><p className="department-disclosure">当前为发起与合作计划，不代表募资完成、备案完成或任何出资承诺。</p></section>
    </DepartmentPage>
  );
}
