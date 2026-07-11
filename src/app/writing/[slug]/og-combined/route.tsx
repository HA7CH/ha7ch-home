import { renderCombined } from "../_og/combined";

export const contentType = "image/png";

type Params = Promise<{ slug: string }>;

// Default combined OG stays English (unchanged address, English content).
export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  return renderCombined(slug, "en");
}
