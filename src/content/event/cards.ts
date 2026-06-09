// Data for an event's two export cards, both 3:4 (1242x1656):
//   card 0 — cover: brand-poster layout (HA7CH logo top-left, a big dynamic headline, the
//            BUILD IN THE FIELD. / HATCH INTO IMPACT. footer row), rebuilt natively per event.
//   card 1 — info: the event facts as a poster, with a QR at the top that opens the event page
//            (ha7ch.com/event/{slug}) — not the WeChat pairing QR.
// The route renders these; this module just shapes the data so both stay in sync.

import type { EventRow } from "@/lib/event/store";

const SITE = "https://ha7ch.com";

export const EVENT_CARD_COUNT = 2; // 0 = cover, 1 = info

export interface EventInfoRow {
  label: string;
  value: string;
}

export interface EventCardData {
  slug: string;
  title: string; // event name — the cover headline
  titleLines: string[]; // headline split on the ｜ delimiter, one big line each on the cover
  brief: string; // tagline (used on the info page, not the cover)
  meta: string; // "上海 Shanghai · 6 月 13 日 ..."
  infoRows: EventInfoRow[];
  pageUrl: string; // QR target on the info card
  footerLeft: string;
  footerRight: string;
}

// Break the event name into big cover lines. Split on the ｜ / | separator, then peel the
// leading brand word onto its own line, so "Ha7ch Shanghai #002｜FDE Meetup" becomes three
// lines: "Ha7ch" / "Shanghai #002" / "FDE Meetup".
function splitTitle(name: string): string[] {
  const segments = name
    .split(/[｜|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const lines: string[] = [];
  segments.forEach((seg, idx) => {
    const brand = idx === 0 ? seg.match(/^(ha7ch)\s+(.+)$/i) : null;
    if (brand) lines.push(brand[1], brand[2]);
    else lines.push(seg);
  });
  return lines.length > 0 ? lines : [name.trim()];
}

function cityOf(name: string): string {
  const n = name.toLowerCase();
  if (name.includes("上海") || n.includes("shanghai")) return "上海 Shanghai";
  if (name.includes("深圳") || n.includes("shenzhen")) return "深圳 Shenzhen";
  if (name.includes("北京") || n.includes("beijing")) return "北京 Beijing";
  return "";
}

export function getEventCardData(ev: EventRow): EventCardData {
  const closed = ev.status !== "open";
  const city = cityOf(ev.name);
  const when = ev.time_info?.trim() || (closed ? "已举办" : "时间待定，定了通知你");
  const meta = [city, when].filter(Boolean).join(" · ");

  // Same facts the live /event page surfaces, in the same words.
  const infoRows: EventInfoRow[] = [
    { label: "时间", value: when },
    ...(city ? [{ label: "城市", value: city }] : []),
    { label: "形式", value: "互助会，所有人围成一圈" },
    ...(closed || ev.seat_total <= 0 ? [] : [{ label: "规模", value: `约 ${ev.seat_total} 位 builder` }]),
    { label: "语言", value: "中文为主，英文也欢迎" },
  ];

  return {
    slug: ev.event_id,
    title: ev.name,
    titleLines: splitTitle(ev.name),
    brief: ev.brief?.trim() || "",
    meta,
    infoRows,
    pageUrl: `${SITE}/event/${ev.event_id}`,
    footerLeft: "BUILD IN THE FIELD.",
    footerRight: "HATCH INTO IMPACT.",
  };
}
