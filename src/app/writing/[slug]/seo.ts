import type { Article } from "@/content/writing";

export type Lang = "en" | "zh";

const BASE_URL = "https://ha7ch.com";

const BASE_KEYWORDS = [
  "HA7CH",
  "lawted",
  "vibe coding",
  "AI native",
  "AI-native Builder Lab",
  "FDE Accelerator",
  "Forward Deployed Engineer",
  "Stanford",
  "Claude Code"
];

export function getWritingUrls(article: Article) {
  const en = `${BASE_URL}/writing/${article.slug}`;
  return {
    en,
    zh: `${en}/zh`,
    md: `${en}/md`,
    // 1200×630 single image — kept for JSON-LD (search-friendly aspect ratio).
    ogImage: `${en}/opengraph-image`,
    // Bilingual combined share images (1:1 + 2.35:1 stitched) used as og:image /
    // twitter:image so link previews match the article's language.
    ogShareEn: `${en}/en/og-combined`,
    ogShareZh: `${en}/zh/og-combined`
  };
}

// Combined OG dimensions (1:1 panel + 2.35:1 panel side by side, height 600).
export const OG_SHARE_SIZE = { width: 2033, height: 600 };

export function getLanguageAlternates(article: Article) {
  const urls = getWritingUrls(article);
  return {
    "en-US": urls.en,
    "zh-CN": urls.zh,
    "x-default": urls.en
  };
}

export function getDescription(article: Article, lang: Lang): string {
  if (lang === "zh") return article.descriptionZh ?? summarize(article.zh);
  return article.description ?? summarize(article.en);
}

export function getKeywords(article: Article): string[] {
  return article.keywords ?? deriveKeywords(article.titleEn, article.titleZh);
}

export function getArticleJsonLd(article: Article, lang: Lang) {
  const urls = getWritingUrls(article);
  const pageUrl = lang === "zh" ? urls.zh : urls.en;
  const title = lang === "zh" ? article.titleZh : article.titleEn;
  const alternativeTitle = lang === "zh" ? article.titleEn : article.titleZh;
  const paragraphs = lang === "zh" ? article.zh : article.en;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    alternativeHeadline: alternativeTitle,
    description: getDescription(article, lang),
    keywords: getKeywords(article).join(", "),
    wordCount: countWords(paragraphs),
    image: [urls.ogImage],
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: lang === "zh" ? "zh-CN" : "en-US",
    author: {
      "@type": "Person",
      name: "lawted",
      url: "https://x.com/lawted2",
      sameAs: ["https://x.com/lawted2", "https://github.com/HA7CH"],
    },
    publisher: {
      "@type": "Organization",
      name: "HA7CH",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/ha7ch-avatar.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    isPartOf: { "@id": `${BASE_URL}/#website` },
    url: pageUrl,
  };
}

export function getBreadcrumbJsonLd(article: Article, lang: Lang) {
  const urls = getWritingUrls(article);
  const pageUrl = lang === "zh" ? urls.zh : urls.en;
  const title = lang === "zh" ? article.titleZh : article.titleEn;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HA7CH",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writing",
        item: `${BASE_URL}/#writing`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  };
}

function summarize(paragraphs: string[], max = 160): string {
  const text = cleanText(paragraphs);
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/[\s,;.!?。！？；：、—-]+\S*$/, "") + "…";
}

function deriveKeywords(titleEn: string, titleZh: string): string[] {
  const titleTerms = titleEn
    .split(/[\s,—-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
  return Array.from(new Set([titleEn, titleZh, ...titleTerms, ...BASE_KEYWORDS]));
}

function countWords(paragraphs: string[]): number {
  const text = cleanText(paragraphs);
  return text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/gu)?.length ?? 0;
}

function cleanText(paragraphs: string[]): string {
  return paragraphs
    .filter((p) => p.trim() !== "---")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
