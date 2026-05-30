import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllSlugs } from "@/content/writing";
import ArticleContent from "./ArticleContent";
import {
  getArticleJsonLd,
  getBreadcrumbJsonLd,
  getDescription,
  getKeywords,
  getLanguageAlternates,
  getWritingUrls,
} from "./seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const description = getDescription(article, "en");
  const keywords = getKeywords(article);
  const urls = getWritingUrls(article);
  return {
    title: article.titleEn,
    description,
    keywords,
    authors: [{ name: "lawted", url: "https://x.com/lawted2" }],
    alternates: {
      canonical: urls.en,
      languages: getLanguageAlternates(article),
      types: { "text/markdown": urls.md }
    },
    openGraph: {
      title: article.titleEn,
      description,
      url: urls.en,
      siteName: "HA7CH",
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: ["https://x.com/lawted2"],
      locale: "en_US",
      alternateLocale: ["zh_CN"],
      images: [urls.ogImage],
      tags: keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleEn,
      description,
      site: "@lawted2",
      creator: "@lawted2",
      images: [urls.ogImage],
    },
  };
}

export default async function WritingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const articleSchema = getArticleJsonLd(article, "en");
  const breadcrumbSchema = getBreadcrumbJsonLd(article, "en");

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
      <ArticleContent article={article} initialLang="en" />
    </>
  );
}
