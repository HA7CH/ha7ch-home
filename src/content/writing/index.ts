import type { Article } from "./types";
import zeroTokenDesign from "./zero-token-design";
import powerballEffect from "./powerball-effect";
import mvpAsResearch from "./mvp-as-research";
import poetryAndThePlaza from "./poetry-and-the-plaza";
import attentionIsAllYouNeed from "./attention-is-all-you-need";
import soWtfIsHa7ch from "./so-wtf-is-ha7ch";
import codeAgentAndTokenEfficiency from "./code-agent-and-token-efficiency";
import ha7chIsAFdeAccelerator from "./ha7ch-is-a-fde-accelerator";
import fdeIsTheFuture from "./fde-is-the-future";
import walkOnTwoLegs from "./walk-on-two-legs";
import theFrogInTheWell from "./the-frog-in-the-well";
import questionEveryInstinct from "./question-every-instinct";
import claudeCodeForEverything from "./claude-code-for-everything";
import baseballAndTheBlameGame from "./baseball-and-the-blame-game";
import stopSayingJiushi from "./stop-saying-jiushi";
import harvardIsNotHarvard from "./harvard-is-not-harvard";
import theIgnoredContinent from "./the-ignored-continent";

export type { Article };

export const articles: Article[] = [theIgnoredContinent, harvardIsNotHarvard, stopSayingJiushi, baseballAndTheBlameGame, claudeCodeForEverything, questionEveryInstinct, theFrogInTheWell, walkOnTwoLegs, ha7chIsAFdeAccelerator, fdeIsTheFuture, codeAgentAndTokenEfficiency, attentionIsAllYouNeed, poetryAndThePlaza, mvpAsResearch, powerballEffect, zeroTokenDesign, soWtfIsHa7ch];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}
