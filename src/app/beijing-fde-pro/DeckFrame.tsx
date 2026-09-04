"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

export function DeckFrame() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    frameRef.current?.focus();
  }, []);

  return (
    <main className={styles.deckShell}>
      <iframe
        ref={frameRef}
        className={styles.deck}
        src="/beijing-fde-pro-deck/index.html"
        title="HA7CH 北京 FDE PRO 大会"
        allow="fullscreen"
      />
    </main>
  );
}
