"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/content/writing";
import { paginateForCards } from "@/content/writing/cards";

type Lang = "zh" | "en";

export default function ArticleContent({
  article,
  initialLang,
}: {
  article: Article;
  initialLang: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [exporting, setExporting] = useState(false);

  const title = lang === "zh" ? article.titleZh : article.titleEn;
  const content = lang === "zh" ? article.zh : article.en;
  const articlePath = `/writing/${article.slug}`;
  const zhPath = `${articlePath}/zh`;

  function selectLang(nextLang: Lang) {
    setLang(nextLang);
    const nextUrl = nextLang === "zh" ? zhPath : articlePath;
    window.history.replaceState(null, "", nextUrl);
  }

  async function exportCards() {
    if (exporting) return;
    setExporting(true);
    try {
      const cards = paginateForCards(content, lang);
      const blobs = await Promise.all(
        cards.map((_, i) =>
          fetch(`/writing/${article.slug}/cards/${lang}/${i}`).then((r) => {
            if (!r.ok) throw new Error(`Failed to fetch card ${i}`);
            return r.blob();
          })
        )
      );

      if (blobs.length === 1) {
        triggerDownload(blobs[0], `${article.slug}-${lang}.png`);
        return;
      }

      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      blobs.forEach((b, i) => {
        zip.file(`${String(i + 1).padStart(2, "0")}.png`, b);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      triggerDownload(zipBlob, `${article.slug}-${lang}.zip`);
    } catch (err) {
      console.error(err);
      alert("Export failed. Check console.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="writing-page">
      <div className="writing-topbar">
        <Link href="/" className="writing-back">
          HA7CH
        </Link>
        <button
          className="export-btn"
          onClick={exportCards}
          disabled={exporting}
          aria-label="Export cards as images"
          title="Export as images"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2.5" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>
      </div>
      <article className="writing-article">
        <header className="writing-header">
          <h1 className="writing-title">{title}</h1>
          <div className="writing-meta">
            <time dateTime={article.date}>{article.dateDisplay}</time>
            <div className="lang-toggle">
              <Link
                href={zhPath}
                className={`lang-btn${lang === "zh" ? " active" : ""}`}
                aria-current={lang === "zh" ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  selectLang("zh");
                }}
              >
                中文
              </Link>
              <span className="lang-divider">/</span>
              <Link
                href={articlePath}
                className={`lang-btn${lang === "en" ? " active" : ""}`}
                aria-current={lang === "en" ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  selectLang("en");
                }}
              >
                English
              </Link>
            </div>
          </div>
        </header>
        <div className="writing-body" data-lang={lang}>
          {content.map((para, i) =>
            para === "---" ? <hr key={i} className="writing-divider" /> : <p key={i}>{para}</p>
          )}
        </div>
      </article>
    </main>
  );
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
