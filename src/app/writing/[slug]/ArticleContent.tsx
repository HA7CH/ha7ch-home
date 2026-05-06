"use client";

import { useState } from "react";
import type { Article } from "@/content/writing";

export default function ArticleContent({ article }: { article: Article }) {
  const [lang, setLang] = useState<"zh" | "en">("en");

  const title = lang === "zh" ? article.titleZh : article.titleEn;
  const content = lang === "zh" ? article.zh : article.en;

  return (
    <main className="writing-page">
      <a href="/" className="writing-back">
        HA7CH
      </a>
      <article className="writing-article">
        <header className="writing-header">
          <h1 className="writing-title">{title}</h1>
          <div className="writing-meta">
            <time dateTime={article.date}>{article.dateDisplay}</time>
            <div className="lang-toggle">
              <button
                className={`lang-btn${lang === "zh" ? " active" : ""}`}
                onClick={() => setLang("zh")}
              >
                中文
              </button>
              <span className="lang-divider">/</span>
              <button
                className={`lang-btn${lang === "en" ? " active" : ""}`}
                onClick={() => setLang("en")}
              >
                English
              </button>
            </div>
          </div>
        </header>
        <div className="writing-body">
          {content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
