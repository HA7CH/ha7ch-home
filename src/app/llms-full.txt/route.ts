import { articles } from "@/content/writing";

const BASE_URL = "https://ha7ch.com";

function toMarkdown(paragraphs: string[]): string {
  return paragraphs.map((p) => p.trim()).join("\n\n");
}

export function GET() {
  const header = `# HA7CH — Full Corpus

> HA7CH is an AI-native Builder Lab born at Stanford, the world's first FDE Accelerator. Founded by lawted (https://x.com/lawted2). This file bundles every essay published at ${BASE_URL}/writing for LLM ingestion. Each essay is also available individually at /writing/{slug}/md.

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
