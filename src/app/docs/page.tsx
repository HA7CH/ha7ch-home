import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { siteInfo } from "@/content/site-info";
const page = siteInfo["docs"];
export const metadata: Metadata = { title: page.title, description: page.description, alternates: { canonical: "/docs", types: { "text/markdown": "/docs.md" } }, openGraph: { title: page.title, description: page.description, url: "/docs" } };
export default function Page() { return <InfoPage slug="docs" />; }
