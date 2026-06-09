import { ImageResponse } from "next/og";
import { loadEventOgData, loadOgAssets, SquarePanel, type EventOgData } from "../_og";

export const contentType = "image/png";
export const dynamic = "force-dynamic";

const FALLBACK: EventOgData = { title: "HA7CH", metaLine: "Closed-Door builder meetup" };

type Params = Promise<{ slug: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const [data, assets] = await Promise.all([loadEventOgData(slug), loadOgAssets()]);
  return new ImageResponse(<SquarePanel data={data ?? FALLBACK} logoUrl={assets.logoUrl} />, {
    width: 1080,
    height: 1080,
    fonts: assets.fonts,
  });
}
