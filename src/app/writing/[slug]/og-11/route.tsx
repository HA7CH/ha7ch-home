import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findLargestUsableFontSize } from "@altano/satori-fit-text";
import { getArticle } from "@/content/writing";

export const contentType = "image/png";

const W = 1080;
const H = 1080;

type Params = Promise<{ slug: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);

  const [svg, fontData600, fontData300] = await Promise.all([
    readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8"),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-300-normal.woff").then((r) => r.arrayBuffer()),
  ]);

  const darkSvg = svg.replace(/#D9D9D9/gi, "#111111");
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(darkSvg)}`;
  const logoWidth = 160;
  const logoHeight = Math.round((logoWidth * 78) / 487);

  const paragraphs = article?.en ?? [];
  const title = article?.titleEn ?? "HA7CH Writing";

  const font600 = { name: "Inter", data: fontData600, weight: 600 as const };
  const font300 = { name: "Inter", data: fontData300, weight: 300 as const };

  const titleFontSize = await findLargestUsableFontSize({
    text: title,
    font: font600,
    maxWidth: 900,
    maxHeight: 160,
    maxFontSize: 96,
    minFontSize: 36,
  });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        {/* Article text background — more room in square format */}
        <div style={{ position: "absolute", inset: 0, padding: "48px 56px 280px", display: "flex", flexDirection: "column", gap: "22px", overflow: "hidden" }}>
          {paragraphs.map((para, i) => (
            <div key={i} style={{ fontSize: 32, fontWeight: 300, color: "#111111", lineHeight: 1.65, fontFamily: "Inter" }}>
              {para}
            </div>
          ))}
        </div>

        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "360px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%)", display: "flex" }} />

        {/* Title bottom-left */}
        <div style={{ position: "absolute", bottom: 96, left: 56, right: 56, display: "flex", fontSize: titleFontSize, fontWeight: 600, fontFamily: "Inter", color: "#111111", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {title}
        </div>

        {/* Logo bottom-right */}
        <div style={{ position: "absolute", bottom: 56, right: 56, display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="HA7CH" width={logoWidth} height={logoHeight} />
        </div>
      </div>
    ),
    { width: W, height: H, fonts: [font600, font300] }
  );
}
