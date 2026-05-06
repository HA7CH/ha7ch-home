import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getArticle, getAllSlugs } from "@/content/writing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);

  const svg = await readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8");
  const darkSvg = svg.replace(/#D9D9D9/gi, "#111111");
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(darkSvg)}`;

  const logoWidth = 160;
  const logoHeight = Math.round((logoWidth * 78) / 487);

  const paragraphs = article?.en ?? [];

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
            padding: "64px 80px 140px",
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
                fontSize: 26,
                fontWeight: 400,
                color: "#111111",
                lineHeight: 1.6,
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
            height: "220px",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 70%)",
            display: "flex",
          }}
        />

        {/* Logo bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            display: "flex",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="HA7CH" width={logoWidth} height={logoHeight} />
        </div>
      </div>
    ),
    { ...size }
  );
}
