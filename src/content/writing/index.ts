import type { Article } from "./types";
import zeroTokenDesign from "./zero-token-design";
import powerballEffect from "./powerball-effect";
import mvpAsResearch from "./mvp-as-research";
import poetryAndThePlaza from "./poetry-and-the-plaza";
import attentionIsAllYouNeed from "./attention-is-all-you-need";
import soWtfIsHa7ch from "./so-wtf-is-ha7ch";
import codeAgentAndTokenEfficiency from "./code-agent-and-token-efficiency";
import weDontKnowWhatHa7chIsYet from "./we-dont-know-what-ha7ch-is-yet";

export type { Article };

export const articles: Article[] = [weDontKnowWhatHa7chIsYet, codeAgentAndTokenEfficiency, attentionIsAllYouNeed, poetryAndThePlaza, mvpAsResearch, powerballEffect, zeroTokenDesign, soWtfIsHa7ch];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}
