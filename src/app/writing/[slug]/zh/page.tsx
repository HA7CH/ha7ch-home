import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllSlugs } from "@/content/writing";
import ArticleContent from "../ArticleContent";

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
  const url = `https://ha7ch.com/writing/${article.slug}/zh`;
  return {
    title: article.titleZh,
    description: article.descriptionZh,
    alternates: { canonical: url },
    openGraph: {
      title: article.titleZh,
      description: article.descriptionZh,
      url,
      siteName: "HA7CH",
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.date,
      locale: "zh_CN",
      alternateLocale: ["en_US"],
    },
  };
}

export default async function WritingZhPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return <ArticleContent article={article} initialLang="zh" />;
}
