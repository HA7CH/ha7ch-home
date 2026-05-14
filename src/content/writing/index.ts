import type { Article } from "./types";
import zeroTokenDesign from "./zero-token-design";
import powerballEffect from "./powerball-effect";
import mvpAsResearch from "./mvp-as-research";
import poetryAndThePlaza from "./poetry-and-the-plaza";
import attentionIsAllYouNeed from "./attention-is-all-you-need";
import soWtfIsHa7ch from "./so-wtf-is-ha7ch";
import codeAgentAndTokenEfficiency from "./code-agent-and-token-efficiency";
import weDontKnowWhatHa7chIsYet from "./we-dont-know-what-ha7ch-is-yet";
import fdeIsTheFuture from "./fde-is-the-future";
import walkOnTwoLegs from "./walk-on-two-legs";
import theFrogInTheWell from "./the-frog-in-the-well";
import questionEveryInstinct from "./question-every-instinct";
import claudeCodeForEverything from "./claude-code-for-everything";
import baseballAndTheBlameGame from "./baseball-and-the-blame-game";

export type { Article };

export const articles: Article[] = [baseballAndTheBlameGame, claudeCodeForEverything, questionEveryInstinct, theFrogInTheWell, walkOnTwoLegs, weDontKnowWhatHa7chIsYet, fdeIsTheFuture, codeAgentAndTokenEfficiency, attentionIsAllYouNeed, poetryAndThePlaza, mvpAsResearch, powerballEffect, zeroTokenDesign, soWtfIsHa7ch];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}
