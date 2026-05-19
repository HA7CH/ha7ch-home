import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllSlugs } from "@/content/writing";
import ArticleContent from "./ArticleContent";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

function summarize(paragraphs: string[], max = 160): string {
  const text = paragraphs
    .filter((p) => p.trim() !== "---")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/[\s,;.!?—-]+\S*$/, "") + "…";
}

const BASE_KEYWORDS = [
  "HA7CH",
  "lawted",
  "vibe coding",
  "AI native",
  "builder lab",
  "Claude Code"
];

function deriveKeywords(titleEn: string, titleZh: string): string[] {
  const titleTerms = titleEn
    .split(/[\s,—-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
  return Array.from(new Set([titleEn, titleZh, ...titleTerms, ...BASE_KEYWORDS]));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const description = article.description ?? summarize(article.en);
  const keywords = article.keywords ?? deriveKeywords(article.titleEn, article.titleZh);
  const url = `https://ha7ch.com/writing/${article.slug}`;
  return {
    title: article.titleEn,
    description,
    keywords,
    authors: [{ name: "lawted", url: "https://x.com/lawted2" }],
    alternates: {
      canonical: url,
      types: { "text/markdown": `${url}/md` }
    },
    openGraph: {
      title: article.titleEn,
      description,
      url,
      siteName: "HA7CH",
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: ["https://x.com/lawted2"],
      locale: "en_US",
      alternateLocale: ["zh_CN"],
      tags: keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleEn,
      description,
      site: "@lawted2",
      creator: "@lawted2",
    },
  };
}

export default async function WritingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `https://ha7ch.com/writing/${article.slug}`;
  const description = article.description ?? summarize(article.en);
  const keywords = article.keywords ?? deriveKeywords(article.titleEn, article.titleZh);
  const ogImage = `${url}/opengraph-image`;
  const wordCount = article.en.join(" ").split(/\s+/).filter(Boolean).length;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titleEn,
    alternativeHeadline: article.titleZh,
    description,
    keywords: keywords.join(", "),
    wordCount,
    image: [ogImage],
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: ["en", "zh-CN"],
    author: {
      "@type": "Person",
      name: "lawted",
      url: "https://x.com/lawted2",
      sameAs: ["https://x.com/lawted2", "https://github.com/HA7CH"],
    },
    publisher: {
      "@type": "Organization",
      name: "HA7CH",
      url: "https://ha7ch.com",
      logo: {
        "@type": "ImageObject",
        url: "https://ha7ch.com/ha7ch-avatar.png",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": "https://ha7ch.com/#website" },
    url,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HA7CH",
        item: "https://ha7ch.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writing",
        item: "https://ha7ch.com/#writing",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.titleEn,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticleContent article={article} />
    </>
  );
}
