"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import snapshot from "@/content/participants.generated.json";

type Participant = { name: string; src: string; job?: string; href?: string };
// Curated eligibility, not a raw GitHub contributor roll-up.
// See docs/participants-sources.md for reviewed code commits and the admission rule.
const admitted = [
  { login: "LAWTED", name: "lawted", location: "Hangzhou, China", avatar: "/avatars/lawted.png" },
  { login: "MWDZ", name: "MWDZ", location: "Mountain View, CA" },
  { login: "dxh2723192626", name: "dxh2723192626", location: "" }
];
const participants: Participant[] = [
  ...admitted.map((person) => {
    const profile = snapshot.participants.find((entry) => entry.login === person.login);
    if (!profile) throw new Error(`Missing verified participant: ${person.login}`);
    return {
      name: person.name, src: person.avatar ?? `${profile.avatarUrl}&s=128`,
      href: profile.href, job: person.location
    };
  }),
  // Keep the three original AI collaborators as visual companions, not human members.
  { name: "Claude", src: "/avatars/claude.png" },
  { name: "ChatGPT", src: "/avatars/chatgpt.png" },
  { name: "Gemini", src: "/avatars/gemini.png" }
];

function Avatar({ person }: { person: Participant }) {
  return <Image src={person.src} alt={person.name} width={64} height={64}
    unoptimized={person.src.startsWith("https://")}
    className="participant-img" />;
}

function AvatarStack({ people }: { people: Participant[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const active = hovered ?? focused;
  return (
    <div className="participants-stack"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(Boolean(focused)); setHovered(null); }}
      onFocus={() => setExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setExpanded(false); setHovered(null); setFocused(null);
        }
      }}>
      {people.map((person, index) => (
        <motion.div key={person.name} className="participant"
          animate={{ marginLeft: index === 0 ? 0 : expanded ? 6 : -8 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26 }}
          style={{ zIndex: active === person.name ? people.length + 1 : people.length - index }}
          onMouseEnter={() => setHovered(person.name)} onMouseLeave={() => setHovered(null)}
          onFocus={() => setFocused(person.name)}>
          {person.href
            ? <a href={person.href} target="_blank" rel="noopener noreferrer" aria-label={[person.name, person.job].filter(Boolean).join(" · ")}><Avatar person={person} /></a>
            : <span tabIndex={0} aria-label={[person.name, person.job].filter(Boolean).join(" · ")}><Avatar person={person} /></span>}
          <AnimatePresence initial={false}>
            {active === person.name && (
              <motion.div className="participant-tooltip"
                initial={{ y: 6, opacity: 0, rotate: 0 }}
                animate={{ y: 18, opacity: 1, rotate: (index % 3 - 1) * 4 }}
                exit={{ y: 6, opacity: 0, rotate: 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: [0.785, 0.135, 0.15, 0.86] }}>
                <div className="tooltip-name">{person.name}</div>
                {person.job && <div className="tooltip-job">{person.job}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export default function Participants() {
  return (
    <section id="participants" className="participants" aria-labelledby="participants-title">
      <h2 id="participants-title" className="section-title">Participants</h2>
      <AvatarStack people={participants} />
    </section>
  );
}
