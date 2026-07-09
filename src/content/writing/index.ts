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
import threeHundredStrangers from "./three-hundred-strangers";
import whyYouShouldComeToHatch from "./why-you-should-come-to-hatch";
import resumeMaterialFrom700Conversations from "./resume-material-from-700-conversations";
import databricksAiProductExperience from "./databricks-ai-product-experience";
import scissorsInTheGap from "./scissors-in-the-gap";
import thirteenQuestionsOnFde from "./thirteen-questions-on-fde";
import fourCitiesFdeReport from "./four-cities-fde-report";

export type { Article };

export const articles: Article[] = [fourCitiesFdeReport, thirteenQuestionsOnFde, scissorsInTheGap, databricksAiProductExperience, resumeMaterialFrom700Conversations, whyYouShouldComeToHatch, threeHundredStrangers, theIgnoredContinent, harvardIsNotHarvard, stopSayingJiushi, baseballAndTheBlameGame, claudeCodeForEverything, questionEveryInstinct, theFrogInTheWell, walkOnTwoLegs, ha7chIsAFdeAccelerator, fdeIsTheFuture, codeAgentAndTokenEfficiency, attentionIsAllYouNeed, poetryAndThePlaza, mvpAsResearch, powerballEffect, zeroTokenDesign, soWtfIsHa7ch];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}
