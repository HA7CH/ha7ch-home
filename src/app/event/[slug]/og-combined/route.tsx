import { ImageResponse } from "next/og";
import sharp from "sharp";
import { loadEventOgData, loadOgAssets, SquarePanel, WidePanel, CFG_235, type EventOgData } from "../_og";

export const contentType = "image/png";
export const dynamic = "force-dynamic";

// Final panel height; the 1:1 and 2.35:1 cards are scaled to it, then stitched side by side
// (square left, wide right) on a light-grey seam — same recipe as the writing combined card.
const PANEL_H = 600;
const W11 = 600; // 1:1
const W235 = Math.round((PANEL_H * 1200) / 511); // 2.35:1 at the same height ≈ 1409
const GAP = 24;
const TOTAL_W = W11 + GAP + W235;

const FALLBACK: EventOgData = { title: "HA7CH", metaLine: "Closed-Door builder meetup" };

type Params = Promise<{ slug: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const [maybeData, assets] = await Promise.all([loadEventOgData(slug), loadOgAssets()]);
  const data = maybeData ?? FALLBACK;

  const img11 = new ImageResponse(<SquarePanel data={data} logoUrl={assets.logoUrl} />, {
    width: 1080,
    height: 1080,
    fonts: assets.fonts,
  });
  const img235 = new ImageResponse(<WidePanel data={data} logoUrl={assets.logoUrl} cfg={CFG_235} />, {
    width: 1200,
    height: 511,
    fonts: assets.fonts,
  });

  const [buf11, buf235] = await Promise.all([
    img11.arrayBuffer().then((b) => sharp(Buffer.from(b)).resize(W11, PANEL_H).toBuffer()),
    img235.arrayBuffer().then((b) => sharp(Buffer.from(b)).resize(W235, PANEL_H).toBuffer()),
  ]);

  const combined = await sharp({
    create: { width: TOTAL_W, height: PANEL_H, channels: 4, background: { r: 240, g: 240, b: 240, alpha: 1 } },
  })
    .composite([
      { input: buf11, left: 0, top: 0 },
      { input: buf235, left: W11 + GAP, top: 0 },
    ])
    .png()
    .toBuffer();

  return new Response(new Uint8Array(combined), { headers: { "Content-Type": "image/png" } });
}
