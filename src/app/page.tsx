import Image from "next/image";

type ListItem = {
  group?: string;
  title?: string;
  description?: string;
  href?: string;
  date?: string;
  meta: string;
};

const projects: ListItem[] = [
  {
    group: "2026",
    title: "Raily",
    description: "Flighty for Rail.",
    href: "https://testflight.apple.com/join/dN2uQn6y",
    date: "2026-05-08",
    meta: "May 8"
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
    href: "https://raily.ha7ch.com",
    date: "2026-04-29",
    meta: "Apr 29"
  },
  {
    group: "Next",
    description: "Small tools, fast experiments, strange ideas.",
    meta: "Soon"
  }
];

const writing: ListItem[] = [
  {
    group: "2026",
    title: "Two Pairs of Eyes",
    href: "/writing/poetry-and-the-plaza",
    date: "2026-05-09",
    meta: "May 9"
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
    title: "Why we bought ha7ch.com",
    href: "/writing/why-we-bought-ha7ch-com",
    meta: "Draft"
  },
  {
    title: "How we ship tiny products in 48 hours",
    href: "/writing/ship-tiny-products-48-hours",
    meta: "Draft"
  }
];

const contacts = [
  { label: "X", href: "https://x.com/lawted2" },
  { label: "GitHub", href: "https://github.com/LAWTED/ha7ch-home" },
  { label: "Email", href: "mailto:lawtedwu@gmail.com" },
  { label: "WeChat", href: "/wechat" }
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
                      <span className="item-title">{item.title}</span>
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

export default function Home() {
  return (
    <main className="homepage">
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
          <time dateTime="2026-04-30">Updated Apr 30, 2026</time>
        </header>

        <p>HA7CH is a tiny builder lab hatching vibe-coded products.</p>

        <p>
          We build small tools, fast experiments, and strange ideas under{" "}
          <BasicLink href="https://ha7ch.com">ha7ch.com</BasicLink>.
        </p>

        <p>
          We write treating vibe coding as a container rather than a wish
          machine, and shipping tiny products in 48 hours.
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
    </main>
  );
}
