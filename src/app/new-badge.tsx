"use client";

import { RoughNotation } from "react-rough-notation";

const ACCENT = "rgb(0, 220, 100)";

export function NewBadge() {
  return (
    <span style={{ marginLeft: "0.5rem", color: ACCENT }}>
      <RoughNotation
        type="circle"
        show
        color={ACCENT}
        strokeWidth={1.5}
        animationDuration={800}
        animationDelay={600}
      >
        <span>New</span>
      </RoughNotation>
    </span>
  );
}
