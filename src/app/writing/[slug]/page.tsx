import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllSlugs } from "@/content/writing";
import ArticleContent from "./ArticleContent";

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
  return {
    title: `${article.titleEn} — HA7CH`,
    description: article.titleZh,
    openGraph: {
      title: article.titleEn,
      description: article.titleZh,
      url: `https://ha7ch.com/writing/${article.slug}`,
      siteName: "HA7CH",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleEn,
      description: article.titleZh,
    },
  };
}

export default async function WritingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return <ArticleContent article={article} />;
}
