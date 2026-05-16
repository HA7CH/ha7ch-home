"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

type Participant = { name: string; src: string; job: string };

const PARTICIPANTS: Participant[] = [
  { name: "lawted", src: "/avatars/lawted.png", job: "Shenzhen" },
  { name: "mapuchuu", src: "/avatars/mapuchuu.png", job: "Seattle" },
  { name: "jaxper", src: "/avatars/jaxper.png", job: "Mountain View" },
  { name: "tbag", src: "/avatars/tbag.png", job: "Mountain View" },
  { name: "SnowCat", src: "/avatars/snowcat.png", job: "Beijing" },
  { name: "Claude", src: "/avatars/claude.png", job: "Anthropic" },
  { name: "ChatGPT", src: "/avatars/chatgpt.png", job: "OpenAI" },
  { name: "Gemini", src: "/avatars/gemini.png", job: "Google" }
];

export default function Participants() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="participants" aria-labelledby="participants-title">
      <h2 id="participants-title" className="section-title">
        Participants
      </h2>

      <div
        className="participants-stack participants-desktop"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          setExpanded(false);
          setHovered(null);
        }}
      >
        {PARTICIPANTS.map((p, i) => (
          <motion.div
            key={p.name}
            className="participant"
            animate={{ marginLeft: i === 0 ? 0 : expanded ? 6 : -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{ zIndex: PARTICIPANTS.length - i }}
            onMouseEnter={() => setHovered(p.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <Image
              src={p.src}
              alt={p.name}
              width={64}
              height={64}
              className="participant-img"
            />
            <AnimatePresence initial={false}>
              {hovered === p.name && (
                <motion.div
                  key={p.name}
                  className="participant-tooltip"
                  initial={{ y: 6, opacity: 0, rotate: 0 }}
                  animate={{
                    y: 18,
                    opacity: 1,
                    rotate: Math.random() * 12 - 6
                  }}
                  exit={{ y: 6, opacity: 0, rotate: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.785, 0.135, 0.15, 0.86]
                  }}
                >
                  <div className="tooltip-name">{p.name}</div>
                  <div className="tooltip-job">{p.job}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <ul className="participants-mobile">
        {PARTICIPANTS.map((p) => (
          <li key={p.name} className="participant-mobile">
            <Image
              src={p.src}
              alt={p.name}
              width={64}
              height={64}
              className="participant-mobile-img"
            />
            <span className="participant-mobile-name">{p.name}</span>
            <span className="participant-mobile-job">{p.job}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
