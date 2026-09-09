import AcronymTitle from "./AcronymTitle";

export type ListItem = {
  group?: string;
  title?: string;
  description?: string;
  homeDescription?: string;
  href?: string;
  date?: string;
  schedule?: string;
  eventStatus?: "active" | "end";
  updatedAt?: string;
  meta: string;
  dead?: boolean;
  kind?: "event" | "department" | "offering";
};

export function BasicLink({
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

export function PostList({ title, items }: { title: string; items: ListItem[] }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const currentYear = new Intl.DateTimeFormat("en", {
    year: "numeric", timeZone: "Asia/Shanghai"
  }).format(new Date());
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
                      <span className={`item-title${item.dead ? " is-dead" : ""}`}>
                        {item.kind === "department" && (item.title === "HDC" || item.title === "HCN")
                          ? <AcronymTitle name={item.title} inline /> : item.title}
                      </span>
                    ) : null}
                    {item.schedule && item.kind !== "event" ? <span className="item-schedule">{item.schedule}</span> : null}
                    {item.description ? (
                      <span className="item-description">{item.description}</span>
                    ) : null}
                  </span>
                  {item.kind === "event" ? (
                    <span className="event-details">
                      {item.date ? (
                        <time dateTime={item.date} title={item.schedule}>
                          {(item.date.startsWith(`${currentYear}-`) ? item.date.slice(5) : item.date).replaceAll("-", ".")}
                        </time>
                      ) : <span className="event-date" title={item.schedule}>{item.eventStatus === "active" ? "滚动招募" : "—"}</span>}
                    </span>
                  ) : item.date && !item.schedule ? (
                    <time dateTime={item.date}>{item.meta}</time>
                  ) : (
                    <span className="item-meta">{item.meta}</span>
                  )}
                </>
              );

              return (
                <li key={item.href ?? item.title ?? item.description ?? item.meta} className={item.kind ? `item-${item.kind}` : undefined}>
                  {item.href ? (
                    <a href={item.href} className="post-list-link">{inner}</a>
                  ) : (
                    <div className="post-list-row">
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
