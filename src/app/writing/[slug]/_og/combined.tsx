import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findLargestUsableFontSize } from "@altano/satori-fit-text";
import { getArticle } from "@/content/writing";
import sharp from "sharp";

export type Lang = "zh" | "en";

// Final output height for both panels
const PANEL_H = 600;
const W11 = 600; // 1:1
const W235 = Math.round((PANEL_H * 1200) / 511); // 2.35:1 scaled to same height ≈ 1408
const GAP = 24;
const TOTAL_W = W11 + GAP + W235;

async function loadAssets(lang: Lang) {
  const [svg, fontData600, fontData300] = await Promise.all([
    readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8"),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-300-normal.woff").then((r) => r.arrayBuffer()),
  ]);
  const darkSvg = svg.replace(/#D9D9D9/gi, "#111111");
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(darkSvg)}`;

  // HarmonyOS Sans SC is bundled locally (Regular 400 body / Bold 700 title) so
  // the Chinese panels never fetch a CJK font at runtime. Only load it for zh.
  let cjkRegular: Buffer | null = null;
  let cjkBold: Buffer | null = null;
  if (lang === "zh") {
    [cjkRegular, cjkBold] = await Promise.all([
      readFile(join(process.cwd(), "public/fonts/HarmonyOS_Sans_SC_Regular.ttf")),
      readFile(join(process.cwd(), "public/fonts/HarmonyOS_Sans_SC_Bold.ttf")),
    ]);
  }
  return { dataUrl, fontData600, fontData300, cjkRegular, cjkBold };
}

export async function renderCombined(slug: string, lang: Lang) {
  const article = getArticle(slug);

  const { dataUrl, fontData600, fontData300, cjkRegular, cjkBold } = await loadAssets(lang);

  const font600 = { name: "Inter", data: fontData600, weight: 600 as const };
  const font300 = { name: "Inter", data: fontData300, weight: 300 as const };

  const rawParagraphs = (lang === "zh" ? article?.zh : article?.en) ?? [];
  // Match the card export (paginateForCards): drop the "---" section separators
  // so they never render as literal dashes in the OG background text.
  const paragraphs = rawParagraphs.map((p) => p.trim()).filter((p) => p && p !== "---");
  const title = (lang === "zh" ? article?.titleZh : article?.titleEn) ?? "HA7CH Writing";

  const isZh = lang === "zh" && cjkRegular != null && cjkBold != null;

  // Fonts registered with satori for both panels. For zh we add HarmonyOS Sans SC
  // at the two weights the layout uses; latin glyphs still fall back to Inter.
  const fonts = isZh
    ? [
        font600,
        font300,
        { name: "HarmonyOS Sans SC", data: cjkRegular as Buffer, weight: 400 as const },
        { name: "HarmonyOS Sans SC", data: cjkBold as Buffer, weight: 700 as const },
      ]
    : [font600, font300];

  const bodyFamily = isZh ? "HarmonyOS Sans SC, Inter" : "Inter";
  const titleFamily = bodyFamily;
  const bodyWeight = isZh ? 400 : 300;
  const titleWeight = isZh ? 700 : 600;
  // satori-fit-text measures with a single font — use the weight the title renders at.
  const measureFont = isZh ? { name: "HarmonyOS Sans SC", data: cjkBold as Buffer, weight: 700 as const } : font600;

  // ── 1:1 panel (1080×1080) ──────────────────────────────────────────────
  const logoW11 = 160;
  const logoH11 = Math.round((logoW11 * 78) / 487);

  const titleSize11 = await findLargestUsableFontSize({
    text: title, font: measureFont, maxWidth: 900, maxHeight: 160, maxFontSize: 96, minFontSize: 36,
  });

  const img11 = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, padding: "56px 56px 220px", display: "flex", flexDirection: "column", gap: "22px", overflow: "hidden" }}>
          {paragraphs.map((para, i) => (
            <div key={i} style={{ fontSize: 32, fontWeight: bodyWeight, color: "#111111", lineHeight: 1.65, fontFamily: bodyFamily }}>{para}</div>
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "320px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 45%)", display: "flex" }} />
        <div style={{ position: "absolute", top: 24, right: 36, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="HA7CH" width={logoW11} height={logoH11} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "180px", padding: "0 56px", display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: titleSize11, fontWeight: titleWeight, fontFamily: titleFamily, color: "#111111", letterSpacing: "-0.02em", lineHeight: 1.1, display: "flex" }}>{title}</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080, fonts }
  );

  // ── 2.35:1 panel (1200×511) ────────────────────────────────────────────
  const logoW235 = 140;
  const logoH235 = Math.round((logoW235 * 78) / 487);

  const titleSize235 = await findLargestUsableFontSize({
    text: title, font: measureFont, maxWidth: 900, maxHeight: 90, maxFontSize: 72, minFontSize: 28,
  });

  const img235 = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, padding: "28px 40px 140px", display: "flex", flexDirection: "column", gap: "14px", overflow: "hidden" }}>
          {paragraphs.map((para, i) => (
            <div key={i} style={{ fontSize: 22, fontWeight: bodyWeight, color: "#111111", lineHeight: 1.6, fontFamily: bodyFamily }}>{para}</div>
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "200px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 55%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 48, left: 40, display: "flex", fontSize: titleSize235, fontWeight: titleWeight, fontFamily: titleFamily, color: "#111111", letterSpacing: "-0.02em", lineHeight: 1 }}>{title}</div>
        <div style={{ position: "absolute", bottom: 50, right: 64, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="HA7CH" width={logoW235} height={logoH235} />
        </div>
      </div>
    ),
    { width: 1200, height: 511, fonts }
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
