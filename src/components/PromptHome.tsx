"use client";

import { useRef, useState } from "react";
import styles from "./PromptHome.module.css";

export default function PromptHome() {
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const prompt = useRef<HTMLParagraphElement>(null);
  const en = language === "en";

  async function copy() {
    const text = prompt.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      if (prompt.current?.textContent === text) setStatus("copied");
    } catch {
      if (prompt.current?.textContent !== text) return;
      const range = document.createRange();
      range.selectNodeContents(prompt.current!);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      setStatus("manual");
    }
  }

  return <main className={styles.shell} lang={en ? "en" : "zh-CN"}>
    <div className={styles.language}>
      <label htmlFor="home-language">{en ? "Language" : "语言"}</label>
      <select id="home-language" value={language} onChange={event => { setLanguage(event.target.value as "zh" | "en"); setStatus("idle"); }}>
        <option value="zh">中文</option><option value="en">English</option>
      </select>
    </div>
    <section className={styles.content} aria-label="HA7CH">
      <h1 className={styles.brand}><img src="/ha7ch-black.svg" alt="HA7CH" width="150" height="24" /></h1>
      <p className={styles.instruction}>copy this prompt to ur agent.</p>
      <div className={styles.promptRow}>
        <p className={styles.prompt} ref={prompt}>{en ? "Read " : "请读取 "}<a href="/SKILL.md" type="text/plain">https://ha7ch.com/SKILL.md</a>{en ? " (or " : " （读不到则访问 "}<a href="/about">https://ha7ch.com/about</a>{en ? " if unavailable) and introduce HA7CH in English. Use only sources you can read." : "），用中文介绍 HA7CH。仅根据已读取的资料回答。"}</p>
        <button type="button" className={styles.copy} onClick={copy} aria-label={en ? "Copy prompt" : "复制提示词"} title={en ? "Copy prompt" : "复制提示词"}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="8" y="8" width="12" height="13" rx="1" /><path d="M16 8V3H3v13h5" /></svg>
        </button>
      </div>
      <p className={styles.status} role="status" aria-live="polite">{status === "copied" ? (en ? "Copied." : "已复制。") : status === "manual" ? (en ? "Text selected. Please copy it manually." : "已选中文本，请手动复制。") : ""}</p>
    </section>
  </main>;
}
