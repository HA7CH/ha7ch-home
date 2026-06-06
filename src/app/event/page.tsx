import Link from "next/link";
import type { Metadata } from "next";
import Roster from "./Roster";

export const metadata: Metadata = {
  title: "Shenzhen · Closed-Door",
  description:
    "A closed-door table of ~21 Shenzhen builders, picked by a bot. No form. Convince the bot in WeChat to get a seat.",
  alternates: { canonical: "/event" },
  openGraph: {
    title: "Shenzhen · Closed-Door · HA7CH",
    description: "No form. Convince the bot to get a seat at the table.",
    url: "https://ha7ch.com/event",
    siteName: "HA7CH",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Shenzhen · Closed-Door · HA7CH",
    description: "No form. Convince the bot to get a seat at the table.",
    site: "@lawted2",
    creator: "@lawted2"
  }
};

// All copy lives in this single object so the page can later be lifted into a
// `[slug]` route by mapping over an array of these.
const event = {
  slug: "shenzhen-2026",
  applyUrl: "https://event.ha7ch.com/apply",
  header: {
    title: "Shenzhen · Closed-Door",
    tagline: "A small table of builders. 深圳闭门局.",
    dateline: "Shenzhen · Summer 2026 · ~21 builders, invite-only"
  },
  intro: [
    "HA7CH is hosting one evening in Shenzhen. About twenty-one builders, picked by a bot, in one room.",
    "This is not a talk. Not a demo day. Not a pitch. It is a small table where people who actually ship trade the real version of what they learned.",
    "There is no sign-up form. To get in, you have to convince our bot you belong at the table."
  ],
  apply: {
    heading: "Apply by convincing the bot",
    lead: "报名方式只有一个：在微信里说服我们的 bot。",
    body: "Most events: fill a form, get auto-approved, receive a static ticket, scan a QR at the door. Ours runs backward. You talk to the bot in WeChat. It asks what you are building. Then it asks one more question. Real builders get sharper under follow-up. People reciting headlines fall apart. That second question is the whole filter.",
    close: "Convince it, and the bot sends you an invitation card. 够格，就收到一张专属邀请函.",
    cta: "Talk to the bot",
    note: "Opens WeChat. No form, no email, no waitlist."
  },
  who: {
    intro: "Builders, not learners. 我们筛的是认知，不是职业.",
    line: "The best table balances four kinds of people:",
    factions: [
      {
        label: "技术派 / Technical",
        copy: "You write the code. You can name the stack, the bottleneck, the number."
      },
      {
        label: "创业派 / Founder",
        copy: "You are running it. Real users, real revenue, real fires to put out."
      },
      {
        label: "场景派 / Domain",
        copy: "You own a real scene: a client, an order, a workflow, a painful problem."
      },
      {
        label: "研究派 / Research",
        copy: "You have your own read on where AI actually lands, not the news version."
      }
    ]
  },
  // Static counts now; later swap for a fetch in src/app/event/roster/route.ts.
  // Totals sum to 21 to match the "~21 builders" headline.
  factionMatrix: [
    { name: "技术派 / Technical", filled: 4, total: 5 },
    { name: "创业派 / Founder", filled: 5, total: 6 },
    { name: "场景派 / Domain", filled: 6, total: 7 },
    { name: "研究派 / Research", filled: 2, total: 3 }
  ],
  oneReal: {
    lead: "You need at least one thing that is real, and that survives a follow-up question:",
    items: [
      "A real project. You can describe the stack, the thing that broke, the number that moved.",
      "A real scene. Real users, a real client, a link that is actually live.",
      "A real resource. A company, an order, data, a problem that genuinely hurts.",
      "A real take. Your own judgment on putting AI into the world, not a repeat of a feed."
    ],
    close: "The bot's only trick is asking one layer deeper. The same sentence, pushed once, either gets more specific or it collapses. We are listening for the version that gets more specific."
  },
  notThis: [
    "Total beginners. If the question is “what is an Agent / RAG / MCP,” this is the wrong room.",
    "People here to be taught. This is not a class and no one is your teacher.",
    "Course sellers. 卖课的，请绕道.",
    "Investors, this round. Not because you are unwelcome, but because the moment money is in the room people start packaging a pitch instead of telling the truth. Maybe the next one."
  ],
  how: [
    "Apply. Tap the button, scan into the bot in WeChat. 全程在微信里, because that is where this crowd already lives.",
    "Convince it. Tell it what you build. It will ask one more question. Answer like a builder, not a brochure.",
    "Get your card. If you clear the bar, the bot sends you an invitation card, a PNG made just for you. That image is your ticket. 这就是你的门票.",
    "Get reminded. The bot pushes you before the night. No app, no email, no calendar invite to lose.",
    "Check in by talking. At the door, you send the bot a message. The conversation is the check-in. 对话即签到，不扫码，不填表.",
    "Get introduced. Once you are in, the bot tells you who to meet: “go find #7, your scenes line up.” A concierge, not a name tag."
  ],
  logistics: [
    { label: "City", value: "Shenzhen 深圳" },
    { label: "When", value: "Summer 2026, one evening" },
    { label: "Format", value: "Closed-door, round-table, off the record" },
    { label: "Size", value: "~21 builders" },
    { label: "Language", value: "Chinese, with English welcome" },
    { label: "Address", value: "Delivered by the bot once you are in" }
  ]
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "HA7CH Shenzhen Closed-Door",
  description:
    "A closed-door table of ~21 Shenzhen builders, picked by a bot. No form. Convince the bot in WeChat to get a seat.",
  url: "https://ha7ch.com/event",
  // Coarse, matches the deliberately vague "Summer 2026" framing. startDate is the one
  // strictly-required Event property for schema.org / Google rich results.
  startDate: "2026-07",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  isAccessibleForFree: true,
  inLanguage: ["zh-CN", "en"],
  location: {
    "@type": "Place",
    name: "Shenzhen (address withheld, delivered by the bot)",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Shenzhen",
      addressRegion: "Guangdong",
      addressCountry: "CN"
    }
  },
  organizer: { "@id": "https://ha7ch.com/#organization" }
};

export default function Event() {
  return (
    <main className="homepage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="article">
        <header>
          <h1 className="wechat-title">{event.header.title}</h1>
          <p className="wechat-back">
            <Link className="basic-link" href="/">← Back to ha7ch.com</Link>
          </p>
          <time>{event.header.dateline}</time>
        </header>

        {event.intro.map((para, i) => (
          <p key={i}>{para}</p>
        ))}

        <div className="event-apply">
          <h2>{event.apply.heading}</h2>
          <p>{event.apply.lead}</p>
          <p>{event.apply.body}</p>
          <p>{event.apply.close}</p>
          <a
            className="event-apply-cta"
            href={event.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {event.apply.cta}
          </a>
          <span className="event-apply-note">{event.apply.note}</span>
        </div>

        <section className="event-section" aria-labelledby="who-title">
          <h2 id="who-title" className="section-title">Who this is for</h2>
          <p>{event.who.intro}</p>
          <p>{event.who.line}</p>
          <div className="event-list">
            {event.who.factions.map((f) => (
              <div className="event-row" key={f.label}>
                <span className="event-row-label">{f.label}</span>
                <span className="event-row-copy">{f.copy}</span>
              </div>
            ))}
          </div>
          <div className="faction-matrix">
            {event.factionMatrix.map((f) => (
              <div className="faction-cell" key={f.name}>
                <div className="faction-name">{f.name}</div>
                <div className="faction-count">
                  {f.filled}/{f.total}
                  {f.total - f.filled === 0
                    ? " · full"
                    : ` · ${f.total - f.filled} seat${f.total - f.filled === 1 ? "" : "s"} left`}
                </div>
                <div className="faction-fill">
                  <span style={{ width: `${(f.filled / f.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="event-section" aria-labelledby="real-title">
          <h2 id="real-title" className="section-title">The one real thing</h2>
          <p>{event.oneReal.lead}</p>
          {event.oneReal.items.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
          <p>{event.oneReal.close}</p>
        </section>

        <section className="event-section" aria-labelledby="not-title">
          <h2 id="not-title" className="section-title">Not this room</h2>
          {event.notThis.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
        </section>

        <section className="event-section" aria-labelledby="how-title">
          <h2 id="how-title" className="section-title">How it works</h2>
          <div className="event-steps">
            {event.how.map((step, i) => (
              <div className="event-step" key={i}>
                <span className="event-step-n">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </section>

        <section className="event-section" aria-labelledby="roster-title">
          <h2 id="roster-title" className="section-title">The roster</h2>
          <Roster />
        </section>

        <section className="event-section" aria-labelledby="logistics-title">
          <h2 id="logistics-title" className="section-title">Logistics</h2>
          <div className="event-list">
            {event.logistics.map((row) => (
              <div className="event-row" key={row.label}>
                <span className="event-row-label">{row.label}</span>
                <span className="event-row-copy">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="event-footer">
          This whole thing runs on a WeChat bot we built.{" "}
          <Link className="basic-link" href="/">← Back to ha7ch.com</Link>
          {" · "}
          <a
            className="basic-link"
            href={event.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Talk to the bot
          </a>
        </p>
      </article>
    </main>
  );
}
