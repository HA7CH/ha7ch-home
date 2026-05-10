import type { Article } from "./types";
import zeroTokenDesign from "./zero-token-design";
import powerballEffect from "./powerball-effect";
import mvpAsResearch from "./mvp-as-research";
import poetryAndThePlaza from "./poetry-and-the-plaza";

export type { Article };

export const articles: Article[] = [poetryAndThePlaza, mvpAsResearch, powerballEffect, zeroTokenDesign];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}
