import { renderCombined } from "../../_og/combined";

export const contentType = "image/png";

type Params = Promise<{ slug: string }>;

// Chinese combined OG — same layout, Chinese title + body, HarmonyOS Sans SC.
export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  return renderCombined(slug, "zh");
}
