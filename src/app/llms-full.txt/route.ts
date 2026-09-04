import { articles } from "@/content/writing";
import { company, companyMarkdown } from "@/content/company";

const BASE_URL = "https://ha7ch.com";

function toMarkdown(paragraphs: string[]): string {
  return paragraphs.map((p) => p.trim()).join("\n\n");
}

export function GET() {
  const header = `# HA7CH — Full Corpus

> ${company.description} This file includes our company overview and every essay published at ${BASE_URL}/writing. Each essay is also available individually at /writing/{slug}/md.

${companyMarkdown()}

`;

  const sections = articles
    .map((a) => {
      const url = `${BASE_URL}/writing/${a.slug}`;
      const title =
        a.titleEn === a.titleZh
          ? a.titleEn
          : `${a.titleEn} / ${a.titleZh}`;
      return [
        `# ${title}`,
        ``,
        `> Published ${a.date} · By lawted · Canonical: ${url}`,
        ``,
        `## English`,
        ``,
        toMarkdown(a.en),
        ``,
        `## 中文`,
        ``,
        toMarkdown(a.zh),
        ``
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return new Response(header + sections, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all"
    }
  });
}
