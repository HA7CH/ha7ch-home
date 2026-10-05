import type { Metadata } from "next";
import PromptHome from "@/components/PromptHome";

export const metadata: Metadata = {
  title: "HA7CH",
  description: "让你的 Agent 读取 HA7CH 公开 Skill，了解公司、企业 AI 服务、教育与创作者合作。Read the public HA7CH Skill with your agent.",
  alternates: { canonical: "/", types: { "text/markdown": "/SKILL.md" } }
};
const organization = { "@context": "https://schema.org", "@type": "Organization", name: "HA7CH", url: "https://ha7ch.com", contactPoint: { "@type": "ContactPoint", email: "lawtedwu@gmail.com", contactType: "customer support" } };
export default function Home() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /><PromptHome /></>; }
