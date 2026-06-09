// Shared building blocks for an event's OG cards, mirroring the writing OG family
// (opengraph-image / og-235 / og-11 / og-combined) but driven by the Supabase event row
// instead of an article. Events have no long body, so the faint background is the event
// brief and the anchor is the name + a meta line (city · time · seats).
//
// _og.tsx is not a route (Next only routes page/route/layout/etc.), it's imported by the
// four OG routes so the layout stays in one place — combined re-uses these exact panels.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createStore, type EventRow } from "@/lib/event/store";

const FONT_FAMILY = "Inter, Noto Sans SC";

export interface EventOgData {
  title: string;
  metaLine: string;
}

function cityOf(name: string): string {
  const n = name.toLowerCase();
  if (name.includes("上海") || n.includes("shanghai")) return "上海 Shanghai";
  if (name.includes("深圳") || n.includes("shenzhen")) return "深圳 Shenzhen";
  if (name.includes("北京") || n.includes("beijing")) return "北京 Beijing";
  return "";
}

async function fetchEvent(slug: string): Promise<EventRow | null> {
  try {
    return await createStore().getEvent(slug);
  } catch {
    return null;
  }
}

export async function loadEventOgData(slug: string): Promise<EventOgData | null> {
  const ev = await fetchEvent(slug);
  if (!ev) return null;
  const closed = ev.status !== "open";
  const city = cityOf(ev.name);
  const when = ev.time_info?.trim() || (closed ? "已举办" : "时间待定，定了通知你");
  const metaLine = [city, when].filter(Boolean).join("　·　");
  return { title: ev.name, metaLine };
}

export interface OgAssets {
  logoUrl: string;
  fonts: { name: string; data: ArrayBuffer; weight: 300 | 400 | 500 | 600 }[];
}

// Logo + Inter (Latin) + Noto Sans SC (the meta line always carries CJK like 上海/位 builder).
export async function loadOgAssets(): Promise<OgAssets> {
  const [svg, inter300, inter600, sc400, sc600] = await Promise.all([
    readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8"),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-300-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-400-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-600-normal.woff").then((r) => r.arrayBuffer()),
  ]);
  const darkSvg = svg.replace(/#D9D9D9/gi, "#111111");
  return {
    logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent(darkSvg)}`,
    fonts: [
      { name: "Inter", data: inter300, weight: 300 },
      { name: "Inter", data: inter600, weight: 600 },
      { name: "Noto Sans SC", data: sc400, weight: 400 },
      { name: "Noto Sans SC", data: sc600, weight: 600 },
    ],
  };
}

const logoH = (w: number) => Math.round((w * 78) / 487);

interface WideCfg {
  metaFont: number;
  titleFont: number;
  titleMaxW: number;
  logoW: number;
  bottom: number;
  left: number;
  right: number;
}

// 1.91:1 (1200×630) and 2.35:1 (1200×511): name + meta anchored bottom-left, logo bottom-right.
export function WidePanel({ data, logoUrl, cfg }: { data: EventOgData; logoUrl: string; cfg: WideCfg }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", bottom: cfg.bottom, left: cfg.left, display: "flex", flexDirection: "column", maxWidth: cfg.titleMaxW }}>
        <div style={{ display: "flex", fontSize: cfg.metaFont, fontWeight: 400, color: "rgba(0,0,0,0.45)", letterSpacing: "0.01em" }}>{data.metaLine}</div>
        <div style={{ display: "flex", marginTop: 12, fontSize: cfg.titleFont, fontWeight: 600, color: "#111111", letterSpacing: "-0.02em", lineHeight: 1.08 }}>{data.title}</div>
      </div>
      <div style={{ position: "absolute", bottom: cfg.bottom + 6, right: cfg.right, display: "flex", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="HA7CH" width={cfg.logoW} height={logoH(cfg.logoW)} />
      </div>
    </div>
  );
}

// 1:1 (1080×1080): logo top-right, name + meta as the bottom strip.
export function SquarePanel({ data, logoUrl }: { data: EventOgData; logoUrl: string }) {
  const logoW = 160;
  return (
    <div style={{ width: "100%", height: "100%", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", top: 56, right: 56, display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="HA7CH" width={logoW} height={logoH(logoW)} />
      </div>
      <div style={{ position: "absolute", bottom: 72, left: 64, right: 64, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 400, color: "rgba(0,0,0,0.45)", letterSpacing: "0.01em" }}>{data.metaLine}</div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 76, fontWeight: 600, color: "#111111", letterSpacing: "-0.02em", lineHeight: 1.06 }}>{data.title}</div>
      </div>
    </div>
  );
}

export const CFG_191: WideCfg = {
  metaFont: 26, titleFont: 60, titleMaxW: 840, logoW: 160, bottom: 60, left: 56, right: 72,
};

export const CFG_235: WideCfg = {
  metaFont: 22, titleFont: 46, titleMaxW: 880, logoW: 130, bottom: 46, left: 44, right: 56,
};
