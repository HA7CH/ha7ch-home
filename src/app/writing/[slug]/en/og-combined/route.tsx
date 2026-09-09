import { renderCombined } from "../../_og/combined";


type Params = Promise<{ slug: string }>;

// Explicit English combined OG — mirrors /og-combined.
export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  return renderCombined(slug, "en");
}
