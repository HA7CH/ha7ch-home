import type { Metadata } from "next";
import { DeckFrame } from "./DeckFrame";

export const metadata: Metadata = {
  title: "北京 FDE PRO 大会",
  description: "HA7CH 北京 FDE PRO 大会演示",
  alternates: {
    canonical: "/beijing-fde-pro"
  }
};

export default function BeijingFdeProPage() {
  return <DeckFrame />;
}
