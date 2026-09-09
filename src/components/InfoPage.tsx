import Link from "next/link";
import { siteInfo } from "@/content/site-info";
export default function InfoPage({ slug }: { slug: string }) {
  const page = siteInfo[slug];
  return <main className="homepage department-page info-page" lang="en">
    <nav className="department-back"><Link className="basic-link" href="/">HA7CH</Link><span> / {page.title}</span></nav>
    <article className="article"><header><h1 className="department-heading">{page.title}</h1></header>
      <p>{page.description}</p>
      {page.sections.map(section => <section key={section.title}><h2>{section.title}</h2>
        {section.paragraphs.map(p => <p key={p}>{p}</p>)}
        {section.code && <pre><code>{section.code}</code></pre>}
        {section.links && <ul>{section.links.map(link => <li key={link.href}><a className="basic-link" href={link.href}>{link.title}</a></li>)}</ul>}
      </section>)}
    </article>
  </main>;
}
