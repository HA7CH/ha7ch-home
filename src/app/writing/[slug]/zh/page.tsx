import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllSlugs } from "@/content/writing";
import ArticleContent from "../ArticleContent";
import {
  getArticleJsonLd,
  getBreadcrumbJsonLd,
  getDescription,
  getKeywords,
  getLanguageAlternates,
  getWritingUrls,
} from "../seo";

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
  const description = getDescription(article, "zh");
  const keywords = getKeywords(article);
  const urls = getWritingUrls(article);
  return {
    title: article.titleZh,
    description,
    keywords,
    authors: [{ name: "lawted", url: "https://x.com/lawted2" }],
    alternates: {
      canonical: urls.zh,
      languages: getLanguageAlternates(article),
    },
    openGraph: {
      title: article.titleZh,
      description,
      url: urls.zh,
      siteName: "HA7CH",
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: ["https://x.com/lawted2"],
      locale: "zh_CN",
      alternateLocale: ["en_US"],
      tags: keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleZh,
      description,
      site: "@lawted2",
      creator: "@lawted2",
    },
  };
}

export default async function WritingZhPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const articleSchema = getArticleJsonLd(article, "zh");
  const breadcrumbSchema = getBreadcrumbJsonLd(article, "zh");

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
      <ArticleContent article={article} initialLang="zh" />
    </>
  );
}
