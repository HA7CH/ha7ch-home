import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { siteInfo } from "@/content/site-info";
const page = siteInfo["contact"];
export const metadata: Metadata = { title: page.title, description: page.description, alternates: { canonical: "/contact", types: { "text/markdown": "/contact.md" } }, openGraph: { title: page.title, description: page.description, url: "/contact" } };
export default function Page() { return <InfoPage slug="contact" />; }
