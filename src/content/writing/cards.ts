import type { Article } from "./types";

export type Lang = "zh" | "en";
export type CardParagraph = { lines: string[] };
export type CardPage = CardParagraph[];

const CARD_WIDTH = 1242;
const CARD_HEIGHT = 1656;
const PADDING_X = 96;
const PADDING_Y = 100;
const LOGO_WIDTH = 120;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 78) / 487);
const TITLE_FONT_SIZE = 38;
const TITLE_LINE_HEIGHT = TITLE_FONT_SIZE * 1.4;
const TITLE_MARGIN_TOP = 51;
const META_MARGIN_TOP = 22;
const META_FONT_SIZE = 30;
const META_LINE_HEIGHT = 40;
const HEADER_RULE_MARGIN_TOP = 34;
const HEADER_RULE_HEIGHT = 1;
const BODY_MARGIN_TOP = { first: 51, rest: 66 };
const BODY_FONT_SIZE = 32;
const BODY_LINE_HEIGHT = BODY_FONT_SIZE * 1.7;
const BODY_PARAGRAPH_GAP = 36;
const FOOTER_HEIGHT = 30;

const CONTENT_WIDTH_EM = (CARD_WIDTH - PADDING_X * 2) / BODY_FONT_SIZE;
const LINE_WIDTH_EM: Record<Lang, number> = {
  zh: CONTENT_WIDTH_EM - 1.5,
  en: CONTENT_WIDTH_EM - 2,
};
const FIRST_PAGE_BODY_HEIGHT =
  CARD_HEIGHT -
  PADDING_Y * 2 -
  LOGO_HEIGHT -
  TITLE_MARGIN_TOP -
  TITLE_LINE_HEIGHT -
  META_MARGIN_TOP -
  META_LINE_HEIGHT -
  HEADER_RULE_MARGIN_TOP -
  HEADER_RULE_HEIGHT -
  BODY_MARGIN_TOP.first -
  FOOTER_HEIGHT;
const REST_PAGE_BODY_HEIGHT =
  CARD_HEIGHT -
  PADDING_Y * 2 -
  LOGO_HEIGHT -
  BODY_MARGIN_TOP.rest -
  FOOTER_HEIGHT;

export function paginateForCards(paragraphs: string[], lang: Lang): CardPage[] {
  const cleaned = paragraphs.map((p) => p.trim()).filter((p) => p && p !== "---");
  if (cleaned.length === 0) return [[]];

  const cards: CardPage[] = [];
  let current: CardPage = [];
  let currentHeight = 0;
  let cardIdx = 0;

  const closeCard = () => {
    cards.push(current);
    current = [];
    currentHeight = 0;
    cardIdx++;
  };

  for (const paragraph of cleaned) {
    const lines = wrapParagraph(paragraph, lang);
    let lineIdx = 0;

    while (lineIdx < lines.length) {
      const capacity =
        cardIdx === 0 ? FIRST_PAGE_BODY_HEIGHT : REST_PAGE_BODY_HEIGHT;
      const gap = current.length > 0 ? BODY_PARAGRAPH_GAP : 0;
      const remainingHeight = capacity - currentHeight - gap;
      const fitCount = Math.floor(remainingHeight / BODY_LINE_HEIGHT);

      if (fitCount <= 0) {
        closeCard();
        continue;
      }

      const take = Math.min(fitCount, lines.length - lineIdx);
      current.push({ lines: lines.slice(lineIdx, lineIdx + take) });
      currentHeight += gap + take * BODY_LINE_HEIGHT;
      lineIdx += take;

      if (lineIdx < lines.length) {
        closeCard();
      }
    }
  }

  if (current.length > 0) cards.push(current);
  return cards.length === 0 ? [[]] : cards;
}

function wrapParagraph(text: string, lang: Lang): string[] {
  const tokens = lang === "zh" ? tokenizeCjkMixed(text) : tokenizeWords(text);
  const lineWidth = LINE_WIDTH_EM[lang];
  const lines: string[] = [];
  let current = "";

  for (const token of tokens) {
    const candidate = joinToken(current, token, lang);
    if (lang === "zh" && current && isClosingPunctuation(token)) {
      current = candidate;
      continue;
    }

    if (!current || measureTextEm(candidate) <= lineWidth) {
      current = candidate;
      continue;
    }

    lines.push(current.trim());
    current = token.trimStart();

    while (measureTextEm(current) > lineWidth) {
      const split = findCharSplit(current, lineWidth);
      lines.push(current.slice(0, split).trim());
      current = current.slice(split).trimStart();
    }
  }

  if (current.trim()) lines.push(current.trim());
  return lines.length > 0 ? lines : [text];
}

function tokenizeWords(text: string): string[] {
  return text.match(/\S+/g) ?? [];
}

function tokenizeCjkMixed(text: string): string[] {
  const tokens: string[] = [];
  const re = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*|\s+|./gu;
  for (const match of text.matchAll(re)) {
    const token = match[0];
    if (token.trim() || tokens.length > 0) tokens.push(token);
  }
  return tokens;
}

function joinToken(current: string, token: string, lang: Lang) {
  if (!current) return token.trimStart();
  if (lang === "en") return `${current} ${token}`;
  return current + token;
}

function isClosingPunctuation(token: string) {
  return /^[，。！？；：、）」』》】）,.!?;:]$/.test(token);
}

function findCharSplit(text: string, lineWidth: number) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    width += charWidthEm(text[i]);
    if (width > lineWidth) return Math.max(1, i);
  }
  return text.length;
}

function measureTextEm(text: string) {
  let width = 0;
  for (const char of text) width += charWidthEm(char);
  return width;
}

function charWidthEm(char: string) {
  if (/\s/.test(char)) return 0.28;
  if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(char)) {
    return 1;
  }
  if (/[ilI1|]/.test(char)) return 0.24;
  if (/[.,:;'`!]/.test(char)) return 0.24;
  if (/["“”‘’]/.test(char)) return 0.3;
  if (/[fjrt]/.test(char)) return 0.36;
  if (/[mwMW]/.test(char)) return 0.82;
  if (/[A-Z]/.test(char)) return 0.62;
  if (/[0-9]/.test(char)) return 0.54;
  if (/[-–]/.test(char)) return 0.45;
  if (char === "—") return 0.78;
  if (/[/\\]/.test(char)) return 0.34;
  return 0.49;
}

export function getCardCount(article: Article, lang: Lang): number {
  return paginateForCards(article[lang], lang).length;
}
