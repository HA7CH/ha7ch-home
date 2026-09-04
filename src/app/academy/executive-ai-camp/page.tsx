import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { executiveCamp } from "@/content/services";

export const metadata: Metadata = {
  title: "老板 AI 战略营 · HA7CH Academy",
  description: executiveCamp.summary,
  alternates: { canonical: executiveCamp.href }
};

export default function ExecutiveCampPage() { return <ServicePage service={executiveCamp} />; }
