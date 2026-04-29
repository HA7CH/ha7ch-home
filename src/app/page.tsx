const projects = [
  {
    name: "Resume Hatch",
    description: "Turn a PDF resume into a living personal site.",
    href: "https://cv.ha7ch.com",
    label: "cv.ha7ch.com"
  },
  {
    name: "Railly Friends",
    description: "One-day social experiments for train travelers.",
    href: "https://raily.ha7ch.com",
    label: "raily.ha7ch.com"
  },
  {
    name: "More soon",
    description: "Small tools, fast experiments, strange ideas."
  }
];

const notes = [
  "Why we bought ha7ch.com",
  "Vibe coding is a container, not a wish machine",
  "How we ship tiny products in 48 hours"
];

const contacts = [
  { label: "X", href: "https://x.com/ha7ch" },
  { label: "GitHub", href: "https://github.com/ha7ch" },
  { label: "Email", href: "mailto:hello@ha7ch.com" }
];

function HatchMark() {
  return (
    <svg
      className="hatch-mark"
      aria-hidden="true"
      viewBox="0 0 64 64"
      role="img"
    >
      <path
        d="M32 58c13.2 0 22-9.3 22-22.2C54 21.4 44 6 32 6S10 21.4 10 35.8C10 48.7 18.8 58 32 58Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        d="M20 38h10l5-7 5 7h6M24 23l6 5 6-5 6 5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <header className="intro" aria-labelledby="site-title">
        <div className="brand-line">
          <HatchMark />
          <p className="stamp">Est. 2026 / tiny lab</p>
        </div>
        <h1 id="site-title">HA7CH</h1>
        <p className="lede">
          A tiny builder lab hatching vibe-coded products.
        </p>
      </header>

      <section className="section-block" aria-labelledby="projects-title">
        <h2 id="projects-title">Projects</h2>
        <div className="project-list">
          {projects.map((project) => (
            <article className="project-row" key={project.name}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              {project.href ? (
                <a href={project.href} rel="noreferrer" target="_blank">
                  {project.label}
                </a>
              ) : (
                <span aria-hidden="true" />
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section-block" aria-labelledby="notes-title">
        <h2 id="notes-title">Notes</h2>
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note}>
              <a href="#notes">{note}</a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="section-block contact" aria-labelledby="contact-title">
        <h2 id="contact-title">Contact</h2>
        <p aria-label="Contact links">
          {contacts.map((contact, index) => (
            <span key={contact.label}>
              <a href={contact.href}>{contact.label}</a>
              {index < contacts.length - 1 ? " / " : ""}
            </span>
          ))}
        </p>
      </footer>
    </main>
  );
}
