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
  kind?: "event";
};

const projects: ListItem[] = [
  {
    group: "Next",
    description: "Small tools, fast experiments, strange ideas.",
    meta: "Soon"
  },
  {
    group: "2026",
    title: "mee7",
    description: "AI-native Luma — vets the guest, not the RSVP.",
    href: "https://mee7.ha7ch.com",
    date: "2026-06-21",
    meta: "Jun 21"
  },
  {
    title: "worldcup.pro",
    description: "The 2026 World Cup, live from your terminal.",
    href: "https://worldcup.ha7ch.com",
    date: "2026-06-10",
    meta: "Jun 10"
  },
  {
    title: "guoyang.pro",
    description: "China's state-owned-enterprise jobs, from your terminal.",
    href: "https://guoyang.ha7ch.com",
    date: "2026-06-01",
    meta: "Jun 1"
  },
  {
    title: "apply.pro",
    description: "Fill 15 grad-school applications from one profile.",
    href: "https://apply.ha7ch.com",
    date: "2026-05-29",
    meta: "May 29"
  },
  {
    title: "kaogong.pro",
    description: "Civil-service exam posts, from your terminal.",
    href: "https://kaogong.ha7ch.com",
    date: "2026-05-27",
    meta: "May 27"
  },
  {
    title: "gaokao.pro",
    description: "AI-native gaokao college planner. Score in, schools out.",
    href: "https://gaokao.ha7ch.com",
    date: "2026-05-25",
    meta: "May 25"
  },
  {
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

const events: ListItem[] = [
  {
    group: "2026",
    title: "San Francisco #005 · AI Native Builder Meetup",
    description: "与 intent.app 联合主办, 地点在 Palo Alto 附近. 扫码报名，聊两句留个邮箱就行.",
    href: "https://mee7.ha7ch.com/e/sf-fde-2026",
    date: "2026-07-12",
    meta: "Jul 18"
  },
  {
    title: "48H FDE Sprint · 26W29",
    description: "飞进真实企业现场，48 小时做出有人真用的 AI MVP. 扫码报名.",
    href: "https://mee7.ha7ch.com/e/fde-sprint",
    date: "2026-06-30",
    meta: "Jul 13–17"
  },
  {
    title: "Beijing #004 · FDE Meetup",
    description: "7/4 下午. 扫码和 bouncer 聊两句就能报名.",
    href: "https://mee7.ha7ch.com/e/beijing-fde-2026",
    date: "2026-06-30",
    meta: "Jul 4"
  },
  {
    title: "Hangzhou #003 · FDE Meetup",
    description: "已办. 32 位 builder 到场.",
    href: "https://mee7.ha7ch.com/e/hangzhou-fde-2026",
    date: "2026-06-19",
    meta: "Done"
  },
  {
    title: "Shanghai #002 · FDE Meetup",
    description: "已办. 31 位 builder 到场.",
    href: "https://mee7.ha7ch.com/e/shanghai-fde-2026",
    date: "2026-06-09",
    meta: "Done"
  },
  {
    title: "Shenzhen #001 · FDE Meetup",
    description: "已办. 31 位 builder 到场.",
    href: "https://mee7.ha7ch.com/e/shenzhen-2026",
    date: "2026-06-04",
    meta: "Done"
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

const latestUpdate = [...events, ...projects, ...writing]
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
  (p) => !p.dead && !p.kind && p.href && p.title && p.description
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

const eventsItemList = {
  "@type": "ItemList",
  "@id": "https://ha7ch.com/#events",
  name: "HA7CH Events",
  description: "Closed-door gatherings for AI builders.",
  numberOfItems: events.filter((e) => e.title && e.href).length,
  itemListElement: events
    .filter((e) => e.title && e.href)
    .map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: e.href!.startsWith("http") ? e.href : `https://ha7ch.com${e.href}`,
      name: e.title
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
        "HA7CH is an AI-native Builder Lab born at Stanford. The world's first FDE Accelerator. Build in the field, hatch into impact.",
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
        "HA7CH is an AI-native Builder Lab born at Stanford. The world's first FDE Accelerator. Build in the field, hatch into impact.",
      publisher: { "@id": "https://ha7ch.com/#organization" },
      inLanguage: ["en", "zh-CN"]
    },
    eventsItemList,
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
              HA7CH: AI-native Builder Lab born at Stanford, the world&apos;s first FDE Accelerator
            </span>
          </h1>
          <time dateTime={latestUpdate}>Updated {formatUpdated(latestUpdate)}</time>
        </header>

        <p>HA7CH is an AI-native Builder Lab born at Stanford.</p>

        <p>It is the world&apos;s first FDE Accelerator.</p>

        <p>Build in the field. Hatch into impact.</p>

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

      <PostList title="Events" items={events} />
      <PostList title="Projects" items={projects} />
      <PostList title="Writing" items={writing} />
      <Participants />
    </main>
  );
}
