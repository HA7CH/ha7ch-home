import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getArticle, getAllSlugs } from "@/content/writing";
import { paginateForCards, type Lang } from "@/content/writing/cards";

export const size = { width: 1242, height: 1656 };
export const contentType = "image/png";

type Params = Promise<{ slug: string; lang: string; index: string }>;

export async function generateStaticParams() {
  const out: { slug: string; lang: string; index: string }[] = [];
  for (const slug of getAllSlugs()) {
    const a = getArticle(slug);
    if (!a) continue;
    for (const lang of ["zh", "en"] as const) {
      const cards = paginateForCards(a[lang], lang);
      for (let i = 0; i < cards.length; i++) {
        out.push({ slug, lang, index: String(i) });
      }
    }
  }
  return out;
}

export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug, lang: langStr, index } = await params;
  if (langStr !== "zh" && langStr !== "en") {
    return new Response("Not found", { status: 404 });
  }
  const lang = langStr as Lang;
  const article = getArticle(slug);
  if (!article) return new Response("Not found", { status: 404 });

  const cards = paginateForCards(article[lang], lang);
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i >= cards.length) {
    return new Response("Not found", { status: 404 });
  }

  const [logoSvg, globeSvg, inter400, inter500, inter600] = await Promise.all([
    readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8"),
    readFile(join(process.cwd(), "public/globe.svg"), "utf-8"),
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff"
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff"
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff"
    ).then((r) => r.arrayBuffer()),
  ]);

  const cjk =
    lang === "zh"
      ? await fetch(
          "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-400-normal.woff"
        ).then((r) => r.arrayBuffer())
      : null;

  const darkLogoSvg = logoSvg.replace(/#D9D9D9/gi, "#111111");
  const logoUrl = `data:image/svg+xml;utf8,${encodeURIComponent(darkLogoSvg)}`;
  const logoWidth = 120;
  const logoHeight = Math.round((logoWidth * 78) / 487);

  const mutedGlobeSvg = globeSvg.replace(/currentColor/g, "rgba(0,0,0,0.4)");
  const globeUrl = `data:image/svg+xml;utf8,${encodeURIComponent(mutedGlobeSvg)}`;

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 }[] = [
    { name: "Inter", data: inter400, weight: 400 },
    { name: "Inter", data: inter500, weight: 500 },
    { name: "Inter", data: inter600, weight: 600 },
  ];
  if (cjk) fonts.push({ name: "Noto Sans SC", data: cjk, weight: 400 });

  const isFirst = i === 0;
  const total = cards.length;
  const title = lang === "zh" ? article.titleZh : article.titleEn;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fdfdfc",
          display: "flex",
          flexDirection: "column",
          fontFamily: lang === "zh" ? "Noto Sans SC, Inter" : "Inter",
          padding: "100px 96px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="HA7CH" width={logoWidth} height={logoHeight} />
        </div>

        {isFirst && (
          <div
            style={{
              marginTop: 51,
              fontSize: 38,
              fontWeight: 500,
              color: "#111",
              letterSpacing: "-0.02em",
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {title}
          </div>
        )}

        <div
          style={{
            marginTop: isFirst ? 51 : 66,
            display: "flex",
            flexDirection: "column",
            gap: 36,
            flex: 1,
            fontSize: 32,
            fontWeight: 400,
            color: "rgba(0,0,0,0.65)",
            lineHeight: 1.7,
            letterSpacing: "-0.005em",
          }}
        >
          {cards[i].map((para, k) => (
            <div
              key={k}
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.7,
              }}
            >
              {para.lines.map((line, lineIdx) => (
                <div
                  key={lineIdx}
                  style={{
                    display: "flex",
                    whiteSpace: "pre",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "rgba(0,0,0,0.4)",
            fontSize: 22,
            fontWeight: 400,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={globeUrl} alt="" width={24} height={24} />
            <span style={{ display: "flex" }}>ha7ch.com</span>
          </div>
          <div style={{ display: "flex" }}>
            {i + 1} / {total}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
