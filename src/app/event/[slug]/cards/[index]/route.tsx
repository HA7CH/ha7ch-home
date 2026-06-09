import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";
import { createStore, type EventRow } from "@/lib/event/store";
import { getEventCardData } from "@/content/event/cards";

export const size = { width: 1242, height: 1656 };
export const contentType = "image/png";
// Events live in Supabase and open/closed status changes over time, so render on demand.
export const dynamic = "force-dynamic";

const PAD = 96;

type Params = Promise<{ slug: string; index: string }>;

async function getEvent(slug: string): Promise<EventRow | null> {
  try {
    return await createStore().getEvent(slug);
  } catch {
    return null;
  }
}

export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug, index } = await params;
  const ev = await getEvent(slug);
  if (!ev) return new Response("Not found", { status: 404 });
  // Export cards are an invite asset for upcoming events only; past events keep their on-page recap.
  if (ev.status !== "open") return new Response("Not found", { status: 404 });

  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i > 1) {
    return new Response("Not found", { status: 404 });
  }
  const data = getEventCardData(ev);

  const [logoSvg, globeSvg, inter400, inter500, inter600, cjk400, cjk500] = await Promise.all([
    readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8"),
    readFile(join(process.cwd(), "public/globe.svg"), "utf-8"),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-400-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@latest/chinese-simplified-500-normal.woff").then((r) => r.arrayBuffer()),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 }[] = [
    { name: "Inter", data: inter400, weight: 400 },
    { name: "Inter", data: inter500, weight: 500 },
    { name: "Inter", data: inter600, weight: 600 },
    { name: "Noto Sans SC", data: cjk400, weight: 400 },
    { name: "Noto Sans SC", data: cjk500, weight: 500 },
  ];

  const darkLogo = `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg.replace(/#D9D9D9/gi, "#111111"))}`;
  const logoWidth = 128;
  const logoHeight = Math.round((logoWidth * 78) / 487);

  // ── Card 0 — Cover: brand-poster layout, headline driven by the event.
  if (i === 0) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Noto Sans SC, Inter",
            padding: PAD,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={darkLogo} alt="HA7CH" width={logoWidth} height={logoHeight} />
          </div>

          <div style={{ display: "flex", flex: 0.5 }} />

          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.titleLines.map((line, k) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  fontSize: 120,
                  fontWeight: 500,
                  color: "#111",
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                }}
              >
                {line}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flex: 1 }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Inter",
              fontSize: 21,
              fontWeight: 500,
              letterSpacing: "0.12em",
              color: "rgba(0,0,0,0.38)",
            }}
          >
            <span style={{ display: "flex" }}>{data.footerLeft}</span>
            <span style={{ display: "flex" }}>{data.footerRight}</span>
          </div>
        </div>
      ),
      { ...size, fonts }
    );
  }

  // ── Card 1 — Info: QR to the event page at the top, then the facts.
  const qrDataUrl = await QRCode.toDataURL(data.pageUrl, {
    margin: 0,
    width: 760,
    errorCorrectionLevel: "M",
    color: { dark: "#111111", light: "#fdfdfc" },
  });
  const mutedGlobe = `data:image/svg+xml;utf8,${encodeURIComponent(globeSvg.replace(/currentColor/g, "rgba(0,0,0,0.4)"))}`;
  const qrSize = 360;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fdfdfc",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Noto Sans SC, Inter",
          padding: PAD,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={darkLogo} alt="HA7CH" width={logoWidth} height={logoHeight} />
        </div>

        {/* QR block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              padding: 28,
              background: "#fff",
              borderRadius: 24,
              border: "1px solid #ececec",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="" width={qrSize} height={qrSize} />
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, fontWeight: 500, color: "#111" }}>扫码报名这一场</div>
          <div style={{ display: "flex", marginTop: 8, fontFamily: "Inter", fontSize: 22, color: "rgba(0,0,0,0.4)" }}>
            {data.pageUrl.replace(/^https:\/\//, "")}
          </div>
        </div>

        <div style={{ display: "flex", height: 1, background: "#eee", marginTop: 44 }} />

        {/* Title */}
        <div style={{ display: "flex", marginTop: 40 }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 500, color: "#111", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
            {data.title}
          </div>
        </div>

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
          {data.infoRows.map((row, k) => (
            <div
              key={k}
              style={{
                display: "flex",
                alignItems: "baseline",
                paddingTop: 22,
                paddingBottom: 22,
                borderTop: k === 0 ? "none" : "1px solid #f0f0ee",
                fontSize: 29,
              }}
            >
              <div style={{ display: "flex", width: 150, flexShrink: 0, color: "rgba(0,0,0,0.4)" }}>{row.label}</div>
              <div style={{ display: "flex", flex: 1, color: "rgba(0,0,0,0.78)" }}>{row.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "Inter",
            fontSize: 22,
            color: "rgba(0,0,0,0.4)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mutedGlobe} alt="" width={24} height={24} />
          <span style={{ display: "flex" }}>ha7ch.com</span>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
