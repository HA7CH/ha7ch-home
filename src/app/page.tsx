import Image from "next/image";
import Participants from "./Participants";
import { articles } from "@/content/writing";

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

const writing: ListItem[] = articles.map((article, index, all) => {
  const year = article.date.slice(0, 4);
  const prevYear = index > 0 ? all[index - 1].date.slice(0, 4) : null;
  return {
    ...(year !== prevYear ? { group: year } : {}),
    title: article.titleEn,
    href: `/writing/${article.slug}`,
    date: article.date,
    meta: article.dateDisplay
  };
});

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
  const id = title.toLowerCase();
  return (
    <section id={id} className="post-list" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="section-title">
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

const liveProjects = projects.filter(
  (p) => !p.dead && p.href && p.title && p.description
);

const projectsItemList = {
  "@type": "ItemList",
  "@id": "https://ha7ch.com/#projects",
  name: "HA7CH Projects",
  description: "Tools, experiments, and apps built by HA7CH.",
  numberOfItems: liveProjects.length,
  itemListElement: liveProjects.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "SoftwareApplication",
      name: p.title,
      description: p.description,
      url: p.href,
      datePublished: p.date,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web, iOS, macOS",
      creator: { "@id": "https://ha7ch.com/#organization" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    }
  }))
};

const writingItemList = {
  "@type": "ItemList",
  "@id": "https://ha7ch.com/#writing",
  name: "HA7CH Writing",
  description:
    "Essays from HA7CH on vibe coding, AI native development, FDE, MVP-as-research, and the future of building.",
  numberOfItems: writing.filter((w) => w.title && w.href).length,
  itemListElement: writing
    .filter((w) => w.title && w.href)
    .map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://ha7ch.com${w.href}`,
      name: w.title
    }))
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://ha7ch.com/#organization",
      name: "HA7CH",
      alternateName: ["ha7ch", "Hatch", "HA7CH Lab"],
      url: "https://ha7ch.com",
      logo: "https://ha7ch.com/ha7ch-avatar.png",
      description:
        "A tiny builder lab and FDE community shipping vibe-coded products, fast experiments, and ideas that probably shouldn't exist — usually in 48 hours.",
      founder: {
        "@type": "Person",
        name: "lawted",
        url: "https://x.com/lawted2"
      },
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
        "A tiny builder lab and FDE community shipping vibe-coded products in 48 hours.",
      publisher: { "@id": "https://ha7ch.com/#organization" },
      inLanguage: ["en", "zh-CN"]
    },
    projectsItemList,
    writingItemList
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
              alt=""
              width={487}
              height={78}
              loading="eager"
              aria-hidden="true"
            />
            <span className="sr-only">
              HA7CH &mdash; a tiny builder lab &amp; FDE community shipping vibe-coded products in 48 hours
            </span>
          </h1>
          <time dateTime={latestUpdate}>Updated {formatUpdated(latestUpdate)}</time>
        </header>

        <p>
          HA7CH is a tiny builder lab. We ship small tools, fast experiments,
          and ideas that probably shouldn&apos;t exist &mdash; usually in 48 hours.
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
