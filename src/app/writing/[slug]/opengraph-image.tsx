import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findLargestUsableFontSize } from "@altano/satori-fit-text";
import { getArticle, getAllSlugs } from "@/content/writing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

const TITLE_MAX_WIDTH = 750;
const TITLE_MAX_HEIGHT = 110;

export default async function Image({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);

  const [svg, fontData] = await Promise.all([
    readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8"),
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff"
    ).then((r) => r.arrayBuffer()),
  ]);

  const darkSvg = svg.replace(/#D9D9D9/gi, "#111111");
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(darkSvg)}`;

  const logoWidth = 160;
  const logoHeight = Math.round((logoWidth * 78) / 487);

  const paragraphs = article?.en ?? [];
  const title = article?.titleEn ?? "HA7CH Writing";

  const font = { name: "Inter", data: fontData, weight: 600 as const };

  const titleFontSize = await findLargestUsableFontSize({
    text: title,
    font,
    maxWidth: TITLE_MAX_WIDTH,
    maxHeight: TITLE_MAX_HEIGHT,
    maxFontSize: 80,
    minFontSize: 32,
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Article text filling the background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "32px 40px 180px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            overflow: "hidden",
          }}
        >
          {paragraphs.map((para, i) => (
            <div
              key={i}
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: "#111111",
                lineHeight: 1.6,
                fontFamily: "Inter",
              }}
            >
              {para}
            </div>
          ))}
        </div>

        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "260px",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 60%)",
            display: "flex",
          }}
        />

        {/* Title bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 40,
            display: "flex",
            fontSize: titleFontSize,
            fontWeight: 600,
            fontFamily: "Inter",
            color: "#111111",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textAlign: "left",
          }}
        >
          {title}
        </div>

        {/* Logo bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="HA7CH" width={logoWidth} height={logoHeight} />
        </div>
      </div>
    ),
    { ...size, fonts: [font] }
  );
}
