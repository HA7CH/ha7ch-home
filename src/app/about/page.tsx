import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { siteInfo } from "@/content/site-info";
const page = siteInfo["about"];
export const metadata: Metadata = { title: page.title, description: page.description, alternates: { canonical: "/about", types: { "text/markdown": "/about.md" } }, openGraph: { title: page.title, description: page.description, url: "/about" } };
export default function Page() { return <InfoPage slug="about" />; }
