"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

const people = [
  {
    name: "Lawted",
    place: "Shenzhen, China",
    timeZone: "Asia/Shanghai"
  },
  {
    name: "Jasper",
    place: "Mountain View, California",
    timeZone: "America/Los_Angeles"
  }
] as const;

type LocalTime = {
  hour: number;
  minute: number;
  period: "am" | "pm";
};

function getLocalTime(timeZone: string): LocalTime {
  const date = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 12);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const period = parts
    .find((part) => part.type === "dayPeriod")
    ?.value.toLowerCase() === "pm"
    ? "pm"
    : "am";

  return { hour, minute, period };
}

export function LocalTimes() {
  const [times, setTimes] = useState<Record<string, LocalTime> | null>(null);

  useEffect(() => {
    const update = () => {
      setTimes(
        Object.fromEntries(
          people.map((person) => [person.name, getLocalTime(person.timeZone)])
        )
      );
    };

    update();
    const interval = window.setInterval(update, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="local-times" aria-label="Local times">
      {people.map((person) => {
        const time = times?.[person.name];

        return (
          <p className="local-time" key={person.name}>
            <span className="clock-text" data-ready={Boolean(time)}>
              <NumberFlow value={time?.hour ?? 12} />
              :
              <NumberFlow
                value={time?.minute ?? 0}
                format={{ minimumIntegerDigits: 2 }}
              />
              {time?.period ?? "am"} {person.name} in {person.place}
            </span>
          </p>
        );
      })}
    </div>
  );
}
