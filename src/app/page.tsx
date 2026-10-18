import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import PromptHome from "@/components/PromptHome";
import { HOME_LANGUAGE_COOKIE } from "@/lib/home-language";
import { resolveHomeLanguage } from "@/lib/home-language.server";

export const metadata: Metadata = {
  title: "HA7CH",
  keywords: ["HA7CH", "AI Native Company", "ANC", "enterprise AI", "AI education", "creator collaboration"],
  description: "HA7CH 帮助企业诊断与部署 AI，提供实战教育、创作者合作及投资孵化。HA7CH helps businesses put AI to work through workflow diagnosis, ANC deployment, practical education and creator collaboration.",
  alternates: { canonical: "/", types: { "text/plain": "/SKILL.md" } }
};
const organization = { "@context": "https://schema.org", "@type": "Organization", name: "HA7CH", description: "Enterprise AI workflow diagnosis and ANC deployment, practical education, creator collaboration, investment and incubation.", url: "https://ha7ch.com", contactPoint: { "@type": "ContactPoint", email: "lawtedwu@gmail.com", contactType: "customer support" } };
export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, cookieStore, requestHeaders] = await Promise.all([
    searchParams,
    cookies(),
    headers()
  ]);
  const language = resolveHomeLanguage({
    requested: params.lang,
    saved: cookieStore.get(HOME_LANGUAGE_COOKIE)?.value,
    acceptLanguage: requestHeaders.get("accept-language")
  });

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /><PromptHome key={language} initialLanguage={language} /></>;
}
