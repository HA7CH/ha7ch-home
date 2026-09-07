import type { Metadata } from "next";
import DepartmentPage from "@/components/DepartmentPage";
import AcronymTitle from "@/components/AcronymTitle";
import { registrationItem } from "@/content/catalog";

export const metadata: Metadata = {
  title: "HCN · HA7CH Creator Network",
  description: "连接长期分享 AI 的创作者。了解 HCN Creator 首期共创计划与合作方式。",
  alternates: { canonical: "/hcn" }
};

export default function HCN() {
  const plan = registrationItem("hcn-creator-pilot-01");
  const open = plan.meta === "报名中";
  return (
    <DepartmentPage title="HCN" subtitle="HA7CH Creator Network"
      heading={<AcronymTitle name="HCN" />}
      introduction="连接长期分享 AI 的内容创作者、行业专家与讲师。我们提供一手信息、选题交流、内容共创、分发和品牌合作机会，让有用的内容被更多人看到。创作者保留自己的判断与表达。"
      sectionTitle={open ? "Join the network" : "Creator pilot"}
      items={[plan]}
    >
      <section className="department-note"><h2 className="section-title">{open ? "How to join" : "本期报名已关闭"}</h2><p>{open ? "进入 mee7 报名页，和报名 BOT 聊聊你正在做的内容、持续分享的方向与合作想法。可使用自己的 Agent 报名，页面也提供微信入口。" : "HCN Creator 首期计划已关闭报名，可进入活动详情了解本期内容。"}</p></section>
    </DepartmentPage>
  );
}
