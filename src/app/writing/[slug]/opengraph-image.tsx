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

  const title = article?.titleEn ?? "HA7CH Writing";
  const date = article?.dateDisplay ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="HA7CH" width={logoWidth} height={logoHeight} />

        {/* Title + date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              color: "#111111",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          {date ? (
            <div
              style={{
                fontSize: 28,
                color: "rgba(0,0,0,0.4)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              {date}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size }
  );
}
