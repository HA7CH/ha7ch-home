import type { Article } from "./types";
import zeroTokenDesign from "./zero-token-design";

export type { Article };

export const articles: Article[] = [zeroTokenDesign];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}
