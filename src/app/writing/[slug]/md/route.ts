import { getArticle, getAllSlugs } from "@/content/writing";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

function toMarkdown(paragraphs: string[]): string {
  return paragraphs.map((p) => p.trim()).join("\n\n");
}

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  const url = `https://ha7ch.com/writing/${article.slug}`;
  const title =
    article.titleEn === article.titleZh
      ? article.titleEn
      : `${article.titleEn} / ${article.titleZh}`;

  const body = [
    `# ${title}`,
    "",
    `> Published ${article.date} · By lawted (https://x.com/lawted2) · Published on HA7CH (https://ha7ch.com)`,
    `> Canonical: ${url}`,
    "",
    "## English",
    "",
    toMarkdown(article.en),
    "",
    "## 中文",
    "",
    toMarkdown(article.zh),
    ""
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
      Link: `<${url}>; rel="canonical"`
    }
  });
}
