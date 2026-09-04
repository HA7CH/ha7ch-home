"use client";

import { useEffect, useRef } from "react";
import { useAnimate, type AnimationPlaybackControls } from "motion/react";

const names = {
  HDC: ["HA7CH", "Deployment", "Company"],
  HCN: ["HA7CH", "Creator", "Network"],
};

export default function AcronymTitle({ name = "HDC", inline = false }: {
  name?: keyof typeof names;
  inline?: boolean;
}) {
  const [root, animate] = useAnimate<HTMLSpanElement>();
  const replay = useRef<() => void>(() => {});
  const words = names[name];
  const fullName = words.join(" ");

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wordNodes = Array.from(element.querySelectorAll<HTMLElement>(".acronym-word"));
    const tails = Array.from(element.querySelectorAll<HTMLElement>(".acronym-tail"));
    let animations: AnimationPlaybackControls[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const stop = () => {
      clearTimeout(timer);
      animations.forEach((animation) => animation.stop());
      animations = [];
    };
    const showFull = () => {
      wordNodes.forEach((word) => { word.style.transform = "none"; word.style.filter = "none"; });
      tails.forEach((letter) => { letter.style.opacity = "1"; letter.style.filter = "none"; });
    };
    const collapse = (instant = false) => {
      stop();
      if (reduced.matches) { showFull(); return; }
      tails.forEach((letter, index) => {
        animations.push(animate(letter, { opacity: 0, filter: "blur(3px)" }, {
          duration: instant ? 0 : 0.14, delay: instant ? 0 : index * 0.004, ease: "easeOut",
        }));
      });
      let compactX = 0;
      wordNodes.forEach((word, index) => {
        const initial = word.querySelector<HTMLElement>(".acronym-initial")!;
        const target = compactX - word.offsetLeft;
        compactX += initial.getBoundingClientRect().width;
        // Keep layout fixed. The initials spring horizontally into the acronym.
        animations.push(animate(word, { transform: `translateX(${target}px)` }, instant
          ? { duration: 0 }
          : { type: "spring", duration: 0.48, bounce: 0.14, delay: 0.08 + index * 0.012 }));
        animations.push(animate(word, { filter: instant ? "blur(0px)" : ["blur(0px)", "blur(1.5px)", "blur(0px)"] }, {
          duration: instant ? 0 : 0.32, delay: instant ? 0 : 0.07, times: [0, 0.3, 1], ease: "easeOut",
        }));
      });
    };
    const play = () => {
      stop();
      if (reduced.matches) { showFull(); return; }
      wordNodes.forEach((word) => {
        animations.push(animate(word, { transform: "translateX(0px)", filter: "blur(0px)" }, {
          type: "spring", duration: 0.38, bounce: 0.1,
          filter: { duration: 0.14, ease: "easeOut" },
        }));
      });
      tails.forEach((letter, index) => {
        animations.push(animate(letter, { opacity: 1, filter: "blur(0px)" }, {
          duration: 0.2, delay: index * 0.003, ease: "easeOut",
        }));
      });
      timer = setTimeout(() => collapse(), 1000);
    };
    replay.current = play;
    const onPreferenceChange = () => collapse(true);
    reduced.addEventListener("change", onPreferenceChange);

    // Wait until a homepage title is visible, so its first animation isn't missed.
    const entrance = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        entrance.disconnect();
        document.fonts.ready.then(() => {
          if (!disposed) { stop(); timer = setTimeout(() => collapse(), 1000); }
        });
      }
    }, { threshold: 0.6 });
    entrance.observe(element);
    let previousWidth = element.offsetWidth;
    const resize = new ResizeObserver(() => {
      if (element.offsetWidth !== previousWidth) {
        previousWidth = element.offsetWidth;
        collapse(true);
      }
    });
    resize.observe(element);

    // The homepage stays a normal link, with no nested button or intercepted click.
    const link = inline ? element.closest("a") : null;
    const onPointerEnter = () => {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) play();
    };
    link?.addEventListener("pointerenter", onPointerEnter);
    return () => {
      disposed = true;
      stop();
      entrance.disconnect();
      resize.disconnect();
      reduced.removeEventListener("change", onPreferenceChange);
      link?.removeEventListener("pointerenter", onPointerEnter);
      replay.current = () => {};
    };
  }, [animate, root, inline, name]);

  const content = (
    <span ref={root} className={`acronym-title${inline ? " acronym-title--inline" : ""}`} aria-label={`${name} · ${fullName}`}>
      <span className="acronym-track" aria-hidden="true">
        {words.map((word, index) => (
          <span className="acronym-word" key={`${index}-${word}`}>
            <span className="acronym-initial">{word[0]}</span>
            {Array.from(word.slice(1) + (index < words.length - 1 ? "\u00a0" : "")).map((letter, i) => (
              <span className="acronym-tail" key={i}>{letter}</span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
  return inline ? content : (
    <button className="acronym-replay" type="button" aria-label={`${name} · ${fullName}，点击重播缩写动效`}
      title={`${fullName} · 点击重播`} onClick={() => replay.current()}>{content}</button>
  );
}
