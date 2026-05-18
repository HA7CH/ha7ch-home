import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllSlugs } from "@/content/writing";
import ArticleContent from "./ArticleContent";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

function summarize(paragraphs: string[], max = 160): string {
  const text = paragraphs.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/[\s,;.!?—-]+\S*$/, "") + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const description = summarize(article.en);
  const url = `https://ha7ch.com/writing/${article.slug}`;
  return {
    title: article.titleEn,
    description,
    authors: [{ name: "lawted", url: "https://x.com/lawted2" }],
    alternates: { canonical: url },
    openGraph: {
      title: article.titleEn,
      description,
      url,
      siteName: "HA7CH",
      type: "article",
      publishedTime: article.date,
      authors: ["https://x.com/lawted2"],
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
  const description = summarize(article.en);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titleEn,
    alternativeHeadline: article.titleZh,
    description,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: ["en", "zh"],
    author: {
      "@type": "Person",
      name: "lawted",
      url: "https://x.com/lawted2",
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
    url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleContent article={article} />
    </>
  );
}
