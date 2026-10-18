"use client";

import { useRef, useState } from "react";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { HOME_LANGUAGE_COOKIE, type HomeLanguage } from "@/lib/home-language";
import styles from "./PromptHome.module.css";

export default function PromptHome({ initialLanguage }: { initialLanguage: HomeLanguage }) {
  const [language, setLanguage] = useState<HomeLanguage>(initialLanguage);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const prompt = useRef<HTMLParagraphElement>(null);
  const en = language === "en";

  function changeLanguage(value: string) {
    if (value !== "en" && value !== "zh") return;
    setLanguage(value);
    setStatus("idle");
    // Keep presentation links shareable and prevent an old ?lang override on reload.
    const url = new URL(window.location.href);
    url.searchParams.set("lang", value);
    window.history.replaceState(null, "", url);
    try {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${HOME_LANGUAGE_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    } catch {
      // The current page and explicit URL still work when cookies are blocked.
    }
  }

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
      <DropdownMenu>
        <DropdownMenu.Trigger render={<button id="home-language" className={styles.languageTrigger} />}>
          <span>Language:</span><span className={styles.currentLanguage}>{en ? "English" : "中文"}</span>
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" /></svg>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" sideOffset={6} className={styles.languageMenu} style={{ zIndex: 30 }}>
          <DropdownMenu.RadioGroup value={language} onValueChange={changeLanguage}>
            <DropdownMenu.RadioItem value="zh" closeOnClick className={styles.languageItem}>中文<DropdownMenu.RadioItemIndicator className={styles.check}>✓</DropdownMenu.RadioItemIndicator></DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="en" closeOnClick className={styles.languageItem}>English<DropdownMenu.RadioItemIndicator className={styles.check}>✓</DropdownMenu.RadioItemIndicator></DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
    <section className={styles.content} aria-label="HA7CH">
      <h1 className={styles.brand}><img src="/ha7ch-black.svg" alt="HA7CH" width="150" height="24" /></h1>
      <p className={styles.instruction}>copy this prompt to ur agent.</p>
      <div className={styles.promptRow}>
        <p className={styles.prompt} ref={prompt}>{en ? "Help me learn about ha7ch.com" : "帮我了解 ha7ch.com"}</p>
        <button type="button" className={styles.copy} onClick={copy} aria-label={en ? "Copy prompt" : "复制提示词"} title={en ? "Copy prompt" : "复制提示词"}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="8" y="8" width="12" height="13" rx="1" /><path d="M16 8V3H3v13h5" /></svg>
        </button>
      </div>
      <p className={styles.status} role="status" aria-live="polite">{status === "copied" ? (en ? "Copied." : "已复制。") : status === "manual" ? (en ? "Text selected. Please copy it manually." : "已选中文本，请手动复制。") : ""}</p>
    </section>
  </main>;
}
