"use client";

import { RoughNotation } from "react-rough-notation";

const ACCENT = "rgb(255, 0, 170)";

export function NewBadge() {
  return (
    <span style={{ marginLeft: "0.5rem", color: ACCENT }}>
      <RoughNotation
        type="circle"
        show
        color={ACCENT}
        strokeWidth={1.5}
        padding={4}
        animationDuration={800}
      >
        <span>New</span>
      </RoughNotation>
    </span>
  );
}
