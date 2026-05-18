import Image from "next/image";
import Participants from "./Participants";

type ListItem = {
  group?: string;
  title?: string;
  description?: string;
  href?: string;
  date?: string;
  meta: string;
  dead?: boolean;
};

const projects: ListItem[] = [
  {
    group: "Next",
    description: "Small tools, fast experiments, strange ideas.",
    meta: "Soon"
  },
  {
    group: "2026",
    title: "AI Native Rank",
    description: "What's your AI Native Rank? S, A, B, C, or D?",
    href: "https://rank.ha7ch.com",
    date: "2026-05-17",
    meta: "May 17"
  },
  {
    title: "job.pro",
    description: "Big-tech campus jobs, from your terminal.",
    href: "https://job.ha7ch.com",
    date: "2026-05-14",
    meta: "May 14"
  },
  {
    title: "微光-Glimmer",
    description: "Your memory is the most beautiful map.",
    href: "https://testflight.apple.com/join/HdcnmhtW",
    date: "2026-05-13",
    meta: "May 13"
  },
  {
    title: "Raily",
    description: "Flighty for Rail.",
    href: "https://apps.apple.com/app/raily-live-train-tracker/id6764391867",
    date: "2026-05-12",
    meta: "May 12"
  },
  {
    title: "cv.pro",
    description: "AI-native resume.",
    href: "https://cv.ha7ch.com",
    date: "2026-04-30",
    meta: "Apr 30"
  },
  {
    title: "Raily Friends",
    description: "One-day social experiments for train travelers.",
    href: "https://raily-friends.ha7ch.com",
    date: "2026-04-29",
    meta: "Apr 29"
  },
  {
    title: "中登BOT",
    description: "A WeChat Bot for reading the global pulse.",
    href: "https://wwc.ha7ch.com",
    date: "2026-05-13",
    meta: "RIP",
    dead: true
  },
  {
    group: "2025",
    title: "Lia browser",
    description: "Liquid-glass Chromium with Arc-style sidebar.",
    href: "https://liabrowser.com",
    date: "2025-08-01",
    meta: "RIP",
    dead: true
  },
  {
    title: "aipeep.me",
    description: "Your AI photo roast master.",
    href: "https://aipeep.me",
    date: "2025-06-01",
    meta: "RIP",
    dead: true
  }
];

const writing: ListItem[] = [
  {
    group: "2026",
    title: "Harvard Isn't Harvard, YC Isn't YC",
    href: "/writing/harvard-is-not-harvard",
    date: "2026-05-19",
    meta: "May 19"
  },
  {
    title: "Baseball and the Blame Game",
    href: "/writing/baseball-and-the-blame-game",
    date: "2026-05-14",
    meta: "May 14"
  },
  {
    title: "Question Every Instinct",
    href: "/writing/question-every-instinct",
    date: "2026-05-13",
    meta: "May 13"
  },
  {
    title: "The Frog in the Well",
    href: "/writing/the-frog-in-the-well",
    date: "2026-05-13",
    meta: "May 13"
  },
  {
    title: "Walk on Two Legs",
    href: "/writing/walk-on-two-legs",
    date: "2026-05-12",
    meta: "May 12"
  },
  {
    title: "HA7CH Is a FDE Accelerator",
    href: "/writing/ha7ch-is-a-fde-accelerator",
    date: "2026-05-11",
    meta: "May 11"
  },
  {
    title: "FDE Is The Future",
    href: "/writing/fde-is-the-future",
    date: "2026-05-11",
    meta: "May 11"
  },
  {
    title: "Code Agent and Token Cost",
    href: "/writing/code-agent-and-token-efficiency",
    date: "2026-05-11",
    meta: "May 11"
  },
  {
    title: "Attention is All You Need",
    href: "/writing/attention-is-all-you-need",
    date: "2026-05-11",
    meta: "May 11"
  },
  {
    title: "Two Pairs of Eyes",
    href: "/writing/poetry-and-the-plaza",
    date: "2026-05-10",
    meta: "May 10"
  },
  {
    title: "MVP as Research",
    href: "/writing/mvp-as-research",
    date: "2026-05-09",
    meta: "May 9"
  },
  {
    title: "Powerball Effect",
    href: "/writing/powerball-effect",
    date: "2026-05-08",
    meta: "May 8"
  },
  {
    title: "Zero Token Design",
    href: "/writing/zero-token-design",
    date: "2026-05-07",
    meta: "May 7"
  },
  {
    title: "So WTF is HA7CH",
    href: "/writing/so-wtf-is-ha7ch",
    date: "2026-04-30",
    meta: "Apr 30"
  }
];

function formatUpdated(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

const latestUpdate = [...projects, ...writing]
  .map((item) => item.date)
  .filter((d): d is string => Boolean(d))
  .sort()
  .at(-1)!;

const contacts = [
  { label: "X", href: "https://x.com/lawted2" },
  { label: "GitHub", href: "https://github.com/HA7CH/ha7ch-home" },
  { label: "Discord", href: "https://discord.gg/DqGBKNANZj" },
  { label: "Reddit", href: "https://www.reddit.com/r/ha7ch/" },
  { label: "Email", href: "mailto:lawtedwu@gmail.com" },
  { label: "WeChat", href: "/wechat" },
  { label: "RedNote", href: "/rednote" }
];

function BasicLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");

  return (
    <a
      className="basic-link"
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {children}
    </a>
  );
}

function PostList({ title, items }: { title: string; items: ListItem[] }) {
  return (
    <section className="post-list" aria-labelledby={`${title.toLowerCase()}-title`}>
      <h2 id={`${title.toLowerCase()}-title`} className="section-title">
        {title}
      </h2>
      <ul>
        <li>
          <ul>
            {items.map((item) => {
              const inner = (
                <>
                  {item.group ? <span className="group-label">{item.group}</span> : null}
                  <span className="item-copy">
                    {item.title ? (
                      <span className={`item-title${item.dead ? " is-dead" : ""}`}>{item.title}</span>
                    ) : null}
                    {item.description ? (
                      <span className="item-description">{item.description}</span>
                    ) : null}
                  </span>
                  <time dateTime={item.date}>{item.meta}</time>
                </>
              );

              return (
                <li key={item.href ?? item.title ?? item.description ?? item.meta}>
                  {item.href ? (
                    <a href={item.href}>{inner}</a>
                  ) : (
                    <div className="post-list-row" aria-disabled="true">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </section>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://ha7ch.com/#organization",
      name: "HA7CH",
      url: "https://ha7ch.com",
      logo: "https://ha7ch.com/ha7ch-avatar.png",
      description:
        "A tiny builder lab shipping vibe-coded products, fast experiments, and ideas that probably shouldn't exist — usually in 48 hours.",
      sameAs: [
        "https://x.com/lawted2",
        "https://github.com/HA7CH/ha7ch-home",
        "https://www.reddit.com/r/ha7ch/",
        "https://discord.gg/DqGBKNANZj"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://ha7ch.com/#website",
      url: "https://ha7ch.com",
      name: "HA7CH",
      description:
        "A tiny builder lab shipping vibe-coded products in 48 hours.",
      publisher: { "@id": "https://ha7ch.com/#organization" },
      inLanguage: "en"
    }
  ]
};

export default function Home() {
  return (
    <main className="homepage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="article">
        <header>
          <h1>
            <Image
              className="brand-logo"
              src="/ha7ch.svg"
              alt="HA7CH"
              width={487}
              height={78}
              loading="eager"
            />
          </h1>
          <time dateTime={latestUpdate}>Updated {formatUpdated(latestUpdate)}</time>
        </header>

        <p>HA7CH is a tiny builder lab.</p>

        <p>
          We ship small tools, fast experiments, and ideas that probably
          shouldn&apos;t exist, usually in 48 hours.
        </p>

        <p>
          Vibe coding is our forcing function, not a wish machine. Build the
          thing. See if it works. Kill it if it doesn&apos;t.
        </p>

        <p>
          You can find us on{" "}
          {contacts.map((contact, index) => (
            <span key={contact.label}>
              <BasicLink href={contact.href}>{contact.label}</BasicLink>
              {index === contacts.length - 2 ? ", or " : index < contacts.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      </article>

      <PostList title="Projects" items={projects} />
      <PostList title="Writing" items={writing} />
      <Participants />
    </main>
  );
}
