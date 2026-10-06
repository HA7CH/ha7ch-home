import type { Metadata } from "next";
import PromptHome from "@/components/PromptHome";

export const metadata: Metadata = {
  title: "HA7CH",
  keywords: ["HA7CH", "AI Native Company", "ANC", "enterprise AI", "AI education", "creator collaboration"],
  description: "HA7CH 帮助企业诊断与部署 AI，提供实战教育、创作者合作及投资孵化。HA7CH helps businesses put AI to work through workflow diagnosis, ANC deployment, practical education and creator collaboration.",
  alternates: { canonical: "/", types: { "text/plain": "/SKILL.md" } }
};
const organization = { "@context": "https://schema.org", "@type": "Organization", name: "HA7CH", description: "Enterprise AI workflow diagnosis and ANC deployment, practical education, creator collaboration, investment and incubation.", url: "https://ha7ch.com", contactPoint: { "@type": "ContactPoint", email: "lawtedwu@gmail.com", contactType: "customer support" } };
export default function Home() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /><PromptHome /></>; }
