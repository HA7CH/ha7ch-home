import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { diagnosis } from "@/content/services";

export const metadata: Metadata = {
  title: "ANC-Diagnosis · 企业 AI 现场诊断",
  description: diagnosis.summary,
  alternates: { canonical: diagnosis.href }
};

export default function DiagnosisPage() { return <ServicePage service={diagnosis} />; }
