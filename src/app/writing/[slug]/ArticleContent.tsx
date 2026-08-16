"use client";

import { useState, type ReactNode } from "react";
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
  const [exporting, setExporting] = useState(false);

  const lang = initialLang;
  const title = lang === "zh" ? article.titleZh : article.titleEn;
  const content = lang === "zh" ? article.zh : article.en;
  const articlePath = `/writing/${article.slug}`;
  const zhPath = `${articlePath}/zh`;

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
              >
                中文
              </Link>
              <span className="lang-divider">/</span>
              <Link
                href={articlePath}
                className={`lang-btn${lang === "en" ? " active" : ""}`}
                aria-current={lang === "en" ? "true" : undefined}
              >
                English
              </Link>
            </div>
          </div>
        </header>
        <div className="writing-body" data-lang={lang}>
          {renderContent(content)}
        </div>
      </article>
    </main>
  );
}

function renderContent(content: string[]) {
  const blocks = [];

  for (let i = 0; i < content.length; i += 1) {
    const para = content[i];

    if (para === "---") {
      blocks.push(<hr key={i} className="writing-divider" />);
      continue;
    }

    if (para.startsWith("|")) {
      const rows = [];
      let j = i;
      while (j < content.length && content[j].startsWith("|")) {
        const cells = parseTableRow(content[j]);
        if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) {
          rows.push(cells);
        }
        j += 1;
      }

      const [head, ...body] = rows;
      if (head && body.length > 0) {
        blocks.push(
          <div key={i} className="writing-table-wrap">
            <table className="writing-table">
              <thead>
                <tr>
                  {head.map((cell, cellIndex) => (
                    <th key={cellIndex} scope="col">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) =>
                      cellIndex === 0 ? (
                        <th key={cellIndex} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={cellIndex}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        i = j - 1;
        continue;
      }
    }

    if (isSectionHeading(para)) {
      blocks.push(
        <h2 key={i} className="writing-section-title">
          {renderInlineMarkdown(para)}
        </h2>,
      );
      continue;
    }

    if (para.startsWith("> ")) {
      blocks.push(
        <blockquote key={i} className="writing-quote">
          {renderInlineMarkdown(para.slice(2))}
        </blockquote>,
      );
      continue;
    }

    blocks.push(<p key={i}>{renderInlineMarkdown(para)}</p>);
  }

  return blocks;
}

function isSectionHeading(text: string): boolean {
  return /^[一二三四五六七八九十百]+、/.test(text) || /^\d+\.\s/.test(text);
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const boldPattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseTableRow(row: string): string[] {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
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
