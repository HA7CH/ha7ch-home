import { ImageResponse } from "next/og";
import { loadEventOgData, loadOgAssets, WidePanel, CFG_191, type EventOgData } from "./_og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Events live in Supabase and open/closed status changes over time, so render on demand.
export const dynamic = "force-dynamic";

const FALLBACK: EventOgData = { title: "HA7CH", metaLine: "Closed-Door builder meetup" };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, assets] = await Promise.all([loadEventOgData(slug), loadOgAssets()]);
  return new ImageResponse(<WidePanel data={data ?? FALLBACK} logoUrl={assets.logoUrl} cfg={CFG_191} />, {
    ...size,
    fonts: assets.fonts,
  });
}
