"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type RosterMember = { job: string; tilt: number };

// Closed-door: no real identities. Neutral dots (CSS circles, no avatars) carry only the
// faction signal in the tooltip until people opt in to a real handle. A preview of the table,
// not the full count.
const ROSTER: RosterMember[] = [
  { job: "场景派 · 跨境电商", tilt: -4 },
  { job: "技术派 · LLM infra", tilt: 3 },
  { job: "创业派 · SaaS", tilt: -5 },
  { job: "研究派 · Agents", tilt: 4 },
  { job: "场景派 · 供应链", tilt: -3 },
  { job: "技术派 · 端侧推理", tilt: 5 },
  { job: "创业派 · 出海工具", tilt: -4 },
  { job: "研究派 · 评测", tilt: 4 }
];

export default function Roster() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className="participants-stack participants-desktop"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          setExpanded(false);
          setHovered(null);
        }}
      >
        {ROSTER.map((p, i) => (
          <motion.div
            key={i}
            className="participant"
            animate={{ marginLeft: i === 0 ? 0 : expanded ? 6 : -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{ zIndex: ROSTER.length - i }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="participant-img event-roster-dot" aria-hidden="true" />
            <AnimatePresence initial={false}>
              {hovered === i && (
                <motion.div
                  key={i}
                  className="participant-tooltip"
                  initial={{ y: 6, opacity: 0, rotate: 0 }}
                  animate={{ y: 18, opacity: 1, rotate: p.tilt }}
                  exit={{ y: 6, opacity: 0, rotate: 0 }}
                  transition={{ duration: 0.2, ease: [0.785, 0.135, 0.15, 0.86] }}
                >
                  <div className="tooltip-name">Builder</div>
                  <div className="tooltip-job">{p.job}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <ul className="participants-mobile">
        {ROSTER.map((p, i) => (
          <li key={i} className="participant-mobile">
            <div className="participant-mobile-img event-roster-dot" aria-hidden="true" />
            <span className="participant-mobile-name">Builder</span>
            <span className="participant-mobile-job">{p.job}</span>
          </li>
        ))}
      </ul>

      <p className="event-roster-note">Anonymized until they opt in. A preview of the table, not the full count.</p>
    </>
  );
}
