import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { siteInfo } from "@/content/site-info";
const page = siteInfo["privacy"];
export const metadata: Metadata = { title: page.title, description: page.description, alternates: { canonical: "/privacy", types: { "text/markdown": "/privacy.md" } }, openGraph: { title: page.title, description: page.description, url: "/privacy" } };
export default function Page() { return <InfoPage slug="privacy" />; }
