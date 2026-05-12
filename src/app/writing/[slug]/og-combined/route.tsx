import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findLargestUsableFontSize } from "@altano/satori-fit-text";
import { getArticle } from "@/content/writing";
import sharp from "sharp";

export const contentType = "image/png";

// Final output height for both panels
const PANEL_H = 600;
const W11 = 600;                              // 1:1
const W235 = Math.round(PANEL_H * 1200 / 511); // 2.35:1 scaled to same height ≈ 1408
const GAP = 24;
const TOTAL_W = W11 + GAP + W235;

type Params = Promise<{ slug: string }>;

async function loadAssets() {
  const [svg, fontData600, fontData300] = await Promise.all([
    readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8"),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-300-normal.woff").then((r) => r.arrayBuffer()),
  ]);
  const darkSvg = svg.replace(/#D9D9D9/gi, "#111111");
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(darkSvg)}`;
  return { dataUrl, fontData600, fontData300 };
}

export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);

  const { dataUrl, fontData600, fontData300 } = await loadAssets();

  const font600 = { name: "Inter", data: fontData600, weight: 600 as const };
  const font300 = { name: "Inter", data: fontData300, weight: 300 as const };

  const paragraphs = article?.en ?? [];
  const title = article?.titleEn ?? "HA7CH Writing";

  // ── 1:1 panel (1080×1080) ──────────────────────────────────────────────
  const logoW11 = 160;
  const logoH11 = Math.round((logoW11 * 78) / 487);

  const titleSize11 = await findLargestUsableFontSize({
    text: title, font: font600, maxWidth: 900, maxHeight: 160, maxFontSize: 96, minFontSize: 36,
  });

  const img11 = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, padding: "56px 56px 220px", display: "flex", flexDirection: "column", gap: "22px", overflow: "hidden" }}>
          {paragraphs.map((para, i) => (
            <div key={i} style={{ fontSize: 32, fontWeight: 300, color: "#111111", lineHeight: 1.65, fontFamily: "Inter" }}>{para}</div>
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "320px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 45%)", display: "flex" }} />
        <div style={{ position: "absolute", top: 24, right: 36, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="HA7CH" width={logoW11} height={logoH11} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "180px", padding: "0 56px", display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: titleSize11, fontWeight: 600, fontFamily: "Inter", color: "#111111", letterSpacing: "-0.02em", lineHeight: 1.1, display: "flex" }}>{title}</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080, fonts: [font600, font300] }
  );

  // ── 2.35:1 panel (1200×511) ────────────────────────────────────────────
  const logoW235 = 140;
  const logoH235 = Math.round((logoW235 * 78) / 487);

  const titleSize235 = await findLargestUsableFontSize({
    text: title, font: font600, maxWidth: 900, maxHeight: 90, maxFontSize: 72, minFontSize: 28,
  });

  const img235 = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, padding: "28px 40px 140px", display: "flex", flexDirection: "column", gap: "14px", overflow: "hidden" }}>
          {paragraphs.map((para, i) => (
            <div key={i} style={{ fontSize: 22, fontWeight: 300, color: "#111111", lineHeight: 1.6, fontFamily: "Inter" }}>{para}</div>
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "200px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 55%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 48, left: 40, display: "flex", fontSize: titleSize235, fontWeight: 600, fontFamily: "Inter", color: "#111111", letterSpacing: "-0.02em", lineHeight: 1 }}>{title}</div>
        <div style={{ position: "absolute", bottom: 50, right: 64, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="HA7CH" width={logoW235} height={logoH235} />
        </div>
      </div>
    ),
    { width: 1200, height: 511, fonts: [font600, font300] }
  );

  // ── Composite with sharp ───────────────────────────────────────────────
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

  return new Response(new Uint8Array(combined), {
    headers: { "Content-Type": "image/png" },
  });
}
