import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "HA7CH";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const svg = await readFile(join(process.cwd(), "public/ha7ch.svg"), "utf-8");
  const darkSvg = svg.replace(/#D9D9D9/gi, "#111111");
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(darkSvg)}`;

  const logoWidth = 700;
  const logoHeight = Math.round((logoWidth * 78) / 487);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <img src={dataUrl} alt="HA7CH" width={logoWidth} height={logoHeight} />
      </div>
    ),
    { ...size }
  );
}
