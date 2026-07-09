import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getArticle } from "@/content/writing";
import { paginateForCards, type Lang } from "@/content/writing/cards";

// 卡片图按需渲染,不在 build 时预烤。曾用 generateStaticParams 把每篇文章 ×
// zh/en × 每张卡片全部预渲染成 PNG(数百张),Vercel 构建机只有 1 个 worker
// 串行跑 satori 排版 + 光栅化,每张还从 CDN 拉一遍中文字库,单次部署因此要 ~10 分钟,
// 且随文章增多线性恶化。改为运行时首访渲染,结果由下方 immutable 缓存头交给 CDN 长期缓存
// (对固定 slug/lang/index 内容稳定不变),build 里不再有这数百张 PNG。
export const dynamic = "force-dynamic";

export const size = { width: 1242, height: 1656 };
export const contentType = "image/png";

type Params = Promise<{ slug: string; lang: string; index: string }>;

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
  const activeLangLabel = lang === "zh" ? "中文" : "English";
  const inactiveLangLabel = lang === "zh" ? "English" : "中文";

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
          overflow: "hidden",
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
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
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

            <div
              style={{
                marginTop: 22,
                display: "flex",
                alignItems: "center",
                gap: 34,
                color: "rgba(0,0,0,0.4)",
                fontSize: 30,
                fontWeight: 400,
                lineHeight: "40px",
                letterSpacing: "-0.00563em",
              }}
            >
              <span style={{ display: "flex" }}>{article.dateDisplay}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    display: "flex",
                    color: "#111",
                    fontWeight: 500,
                  }}
                >
                  {activeLangLabel}
                </span>
                <span style={{ display: "flex", opacity: 0.4 }}>/</span>
                <span style={{ display: "flex" }}>{inactiveLangLabel}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: 34,
                height: 1,
                background: "#f2f2f2",
                display: "flex",
              }}
            />
          </div>
        )}

        <div
          style={{
            marginTop: isFirst ? 51 : 66,
            display: "flex",
            flexDirection: "column",
            gap: 36,
            flex: 1,
            width: "100%",
            overflow: "hidden",
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
                width: "100%",
                overflow: "hidden",
                lineHeight: 1.7,
              }}
            >
              {para.lines.map((line, lineIdx) => (
                <div
                  key={lineIdx}
                  style={{
                    display: "flex",
                    width: "100%",
                    overflow: "hidden",
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
            width: "100%",
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
    {
      ...size,
      fonts,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      },
    }
  );
}
