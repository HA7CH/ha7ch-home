import { ImageResponse } from "next/og";
import { loadEventOgData, loadOgAssets, WidePanel, CFG_235, type EventOgData } from "../_og";

export const contentType = "image/png";
export const dynamic = "force-dynamic";

const FALLBACK: EventOgData = { title: "HA7CH", metaLine: "Closed-Door builder meetup" };

type Params = Promise<{ slug: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const [data, assets] = await Promise.all([loadEventOgData(slug), loadOgAssets()]);
  return new ImageResponse(<WidePanel data={data ?? FALLBACK} logoUrl={assets.logoUrl} cfg={CFG_235} />, {
    width: 1200,
    height: 511,
    fonts: assets.fonts,
  });
}
