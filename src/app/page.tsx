import Image from "next/image";
import { LocalTimes } from "./local-times";

const projects = [
  {
    group: "Live",
    title: "Resume Hatch",
    description: "Turn a PDF resume into a living personal site.",
    href: "https://cv.ha7ch.com",
    meta: "cv.ha7ch.com"
  },
  {
    title: "Railly Friends",
    description: "One-day social experiments for train travelers.",
    href: "https://raily.ha7ch.com",
    meta: "raily.ha7ch.com"
  },
  {
    group: "Next",
    title: "More soon",
    description: "Small tools, fast experiments, strange ideas.",
    href: "/more-soon",
    meta: "Soon"
  }
];

const notes = [
  {
    group: "2026",
    title: "Why we bought ha7ch.com",
    href: "/why-we-bought-ha7ch-com",
    meta: "Draft"
  },
  {
    title: "Vibe coding is a container, not a wish machine",
    href: "/vibe-coding-container",
    meta: "Draft"
  },
  {
    title: "How we ship tiny products in 48 hours",
    href: "/ship-tiny-products-48-hours",
    meta: "Draft"
  }
];

const contacts = [
  { label: "X", href: "https://x.com/ha7ch" },
  { label: "GitHub", href: "https://github.com/ha7ch" },
  { label: "Email", href: "mailto:hello@ha7ch.com" }
];

type ListItem = {
  group?: string;
  title: string;
  description?: string;
  href: string;
  meta: string;
};

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
            {items.map((item) => (
              <li key={item.title}>
                <a href={item.href}>
                  {item.group ? <span className="group-label">{item.group}</span> : null}
                  <span className="item-copy">
                    <span className="item-title">{item.title}</span>
                    {item.description ? (
                      <span className="item-description">{item.description}</span>
                    ) : null}
                  </span>
                  <time>{item.meta}</time>
                </a>
              </li>
            ))}
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
          <BasicLink href="https://cv.ha7ch.com">Resume Hatch</BasicLink> turns a
          PDF resume into a living personal site.{" "}
          <BasicLink href="https://raily.ha7ch.com">Railly Friends</BasicLink>{" "}
          explores one-day social experiments for train travelers.
        </p>

        <p>
          We write notes about buying domains, treating vibe coding as a
          container rather than a wish machine, and shipping tiny products in 48
          hours.
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
      <PostList title="Notes" items={notes} />

      <footer className="site-footer">
        <div className="footer-row">
          <LocalTimes />
        </div>
      </footer>
    </main>
  );
}
