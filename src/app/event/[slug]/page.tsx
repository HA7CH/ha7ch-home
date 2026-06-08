import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createStore, type EventRow } from "@/lib/event/store";

// Per-event page, deliberately minimal: just the QR (for events still taking people) and the
// facts. For past events, the on-site recap. No "who this is for" / "how it works" framing.
export const dynamic = "force-dynamic";

const SITE = "https://ha7ch.com";

async function getEvent(slug: string): Promise<EventRow | null> {
  try {
    return await createStore().getEvent(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEvent(slug);
  if (!ev) return { title: "活动 · HA7CH" };
  const desc = ev.brief?.trim() || "HA7CH 闭门 builder 交流会。扫码和 bouncer 聊两句就能报名。";
  return {
    title: `${ev.name} · HA7CH`,
    description: desc.slice(0, 140),
    alternates: { canonical: `/event/${slug}` },
    openGraph: { title: ev.name, description: desc.slice(0, 140), url: `${SITE}/event/${slug}`, siteName: "HA7CH", type: "website" },
  };
}

function cityOf(name: string): string {
  const n = name.toLowerCase();
  if (name.includes("上海") || n.includes("shanghai")) return "上海 Shanghai";
  if (name.includes("深圳") || n.includes("shenzhen")) return "深圳 Shenzhen";
  if (name.includes("北京") || n.includes("beijing")) return "北京 Beijing";
  return "";
}

type Recap = { summary?: string; sections?: { title: string; points: string[] }[]; quote?: string };
function parseRecap(json: string | null): Recap | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Recap;
  } catch {
    return null;
  }
}

export default async function EventBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ev = await getEvent(slug);
  if (!ev) notFound();

  const closed = ev.status !== "open";
  const city = cityOf(ev.name);
  const when = ev.time_info?.trim() || (closed ? "已举办" : "时间待定，定了通知你");
  const recap = parseRecap(ev.recap_json);

  // WeChat entry: embed the worker's pairing page (event.ha7ch.com/apply) directly, so the QR
  // shown here IS the live iLink pairing QR. One scan adds the bouncer bot in WeChat (no extra
  // hop through a webpage). The worker owns getBotQrCode + status polling + activation.

  const info: { label: string; value: string }[] = [
    { label: "时间", value: when },
    ...(city ? [{ label: "城市", value: city }] : []),
    { label: "形式", value: "互助会，所有人围成一圈" },
    ...(closed ? [] : [{ label: "规模", value: `约 ${ev.seat_total} 位 builder` }]),
    { label: "语言", value: "中文为主，英文也欢迎" },
    ...(closed ? [] : [{ label: "地址", value: ev.address?.trim() || "确认后由主办统一通知到场的人" }]),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.name,
    description: ev.brief?.trim() || "HA7CH 闭门 builder 交流会。",
    url: `${SITE}/event/${slug}`,
    ...(ev.start_at > 0 ? { startDate: new Date(ev.start_at).toISOString() } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: ["zh-CN", "en"],
    organizer: { "@id": "https://ha7ch.com/#organization" },
  };

  return (
    <main className="homepage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="article">
        <div className="writing-topbar">
          <Link href="/" className="writing-back">HA7CH</Link>
        </div>
        <header>
          <h1 className="wechat-title">{ev.name}</h1>
          {(city || when) && <time>{[city, when].filter(Boolean).join(" · ")}</time>}
        </header>

        {!closed ? (
          <div className="event-qr">
            <iframe
              src="https://event.ha7ch.com/apply?embed=1"
              title="微信扫码报名"
              loading="lazy"
              scrolling="no"
              className="event-qr-frame"
            />
            <p className="event-qr-note">微信扫码，进 bot 跟 bouncer 聊两句就能报名。</p>
          </div>
        ) : null}

        {closed ? <p className="event-closed-note">这一场已经办过了。</p> : null}

        <section className="event-section" aria-labelledby="info-title">
          <h2 id="info-title" className="section-title">信息</h2>
          <div className="event-list">
            {info.map((row) => (
              <div className="event-row" key={row.label}>
                <span className="event-row-label">{row.label}</span>
                <span className="event-row-copy">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {ev.brief?.trim() ? (
          <section className="event-section" aria-labelledby="about-title">
            <h2 id="about-title" className="section-title">关于这一场</h2>
            <p>{ev.brief}</p>
          </section>
        ) : null}

        {recap ? (
          <section className="event-section" aria-labelledby="recap-title">
            <h2 id="recap-title" className="section-title">现场纪要</h2>
            {recap.summary ? <p>{recap.summary}</p> : null}
            {(recap.sections ?? []).map((s) => (
              <div className="recap-block" key={s.title}>
                <h3 className="recap-sub">{s.title}</h3>
                <ul className="recap-list">
                  {s.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
            {recap.quote ? <blockquote className="recap-quote">{recap.quote}</blockquote> : null}
          </section>
        ) : null}

      </article>

      <style>{`
        .event-qr { text-align: center; margin: 1.5rem 0 2.5rem; }
        .event-qr-frame { display: inline-block; width: 264px; height: 288px; border: 1px solid #e6e6e2;
          border-radius: 0.85rem; box-shadow: 0 1px 2px rgba(0,0,0,0.03); background: #fff; color-scheme: light; }
        .event-qr-note { margin-top: 0.9rem; font-size: 0.9rem; color: #555; }
        .event-qr .event-apply-cta { margin-top: 0.6rem; }
        .event-closed-note { color: #999; font-size: 0.95rem; margin-bottom: 0.5rem; }
        .recap-block { margin-top: 1.25rem; }
        .recap-sub { font-size: 0.95rem; font-weight: 600; color: #111; margin-bottom: 0.5rem; }
        .recap-list { margin: 0; padding-left: 1.1rem; }
        .recap-list li { font-size: 0.92rem; color: #333; line-height: 1.7; margin-bottom: 0.35rem; }
        .recap-quote { margin: 1.5rem 0 0; padding: 0.75rem 1rem; border-left: 2px solid #111; background: #f7f7f4;
          font-size: 0.92rem; color: #333; line-height: 1.7; }
      `}</style>
    </main>
  );
}
