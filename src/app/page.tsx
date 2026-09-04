import Image from "next/image";
import Participants from "./Participants";
import { articles } from "@/content/writing";
import { company, departments, offerings } from "@/content/company";
import { BasicLink, PostList, type ListItem } from "@/components/PostList";
import { events, projects } from "@/content/catalog";

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
  .map((item) => item.updatedAt ?? item.date)
  .filter((d): d is string => Boolean(d))
  .concat(company.updatedAt)
  .sort()
  .at(-1)!;

const contacts = [
  { label: "公众号", href: "/wechat" },
  { label: "X", href: "https://x.com/lawted2" },
  { label: "GitHub", href: "https://github.com/HA7CH/ha7ch-home" },
  { label: "Discord", href: "https://discord.gg/DqGBKNANZj" },
  { label: "Reddit", href: "https://www.reddit.com/r/ha7ch/" },
  { label: "Email", href: "mailto:lawtedwu@gmail.com" },
  { label: "RedNote", href: "/rednote" }
];

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
      creator: { "@id": "https://ha7ch.com/#organization" }
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
      description: company.description,
      department: departments.map((department) => ({
        "@type": "Organization",
        name: department.title,
        description: department.description
      })),
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
      description: company.description,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
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
              {company.title}
            </span>
          </h1>
          <time dateTime={latestUpdate}>Updated {formatUpdated(latestUpdate)}</time>
        </header>

        <p lang="zh-CN">{company.tagline}</p>

        <p className="home-contacts">
          <span className="contact-label">You can find us on</span>{" "}
          <span className="contact-links">
          {contacts.map((contact, index) => (
            <span className="contact-link-group" key={contact.label}>
              <BasicLink href={contact.href}>{contact.label}</BasicLink>
              <span className="contact-separator">{index === contacts.length - 2 ? ", or " : index < contacts.length - 1 ? ", " : "."}</span>
            </span>
          ))}
          </span>
        </p>
      </article>

      <PostList title="Departments" items={departments} />
      <PostList title="Services" items={offerings} />
      <p className="service-contact" lang="zh-CN">
        企业诊断、课程与合作，<BasicLink href="mailto:lawtedwu@gmail.com">联系 Lawted</BasicLink>。
        创作者可了解 <BasicLink href="https://mee7.ha7ch.com/e/hcn-creator-pilot-01">HCN Creator 计划</BasicLink>。
      </p>
      <PostList title="Events" items={events} />
      <PostList title="Projects" items={projects} />
      <PostList title="Writing" items={writing} />
      <Participants />
    </main>
  );
}
