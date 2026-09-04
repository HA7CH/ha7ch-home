import Link from "next/link";
import { BasicLink, PostList } from "./PostList";
import type { Service } from "@/content/services";

export default function ServicePage({ service }: { service: Service }) {
  return (
    <main className="homepage department-page" lang="zh-CN">
      <nav className="department-back" aria-label="返回导航">
        <Link className="basic-link" href="/">HA7CH</Link><span> / </span>
        <Link className="basic-link" href={service.parentHref}>{service.department}</Link>
      </nav>
      <article className="article">
        <header>
          <p className="department-eyebrow">{service.subtitle}</p>
          <h1 className="department-heading">{service.title}</h1>
        </header>
        <p>{service.introduction}</p>
      </article>
      <PostList title="Program & pricing" items={service.plans.map((plan) => ({ ...plan, kind: "offering" as const }))} />
      {service.sections.map((section) => (
        <section key={section.title} className="department-note">
          <h2 className="section-title">{section.title}</h2>
          {section.intro && <p>{section.intro}</p>}
          <ul className="service-outline">
            {section.items.map((item) => (
              <li key={item.title}><h3>{item.title}</h3><p>{item.description}</p></li>
            ))}
          </ul>
        </section>
      ))}
      <section className="department-note">
        <h2 className="section-title">Agent Skill</h2>
        <p>和 FDE Camp 一样，可以通过 Skill 了解适合人群、流程、交付与咨询方式。</p>
        {service.github
          ? <p><BasicLink href={service.github}>在 GitHub 查看 {service.skill}</BasicLink></p>
          : <p className="department-disclosure">{service.skill} 已整理，GitHub 仓库待发布。</p>}
      </section>
      <section className="department-note">
        <h2 className="section-title">咨询与下一步</h2>
        <p>添加 Lawted 微信，备注「{service.contactNote}」。也可以<BasicLink href={`mailto:lawtedwu@gmail.com?subject=${encodeURIComponent(service.contactNote)}`}>邮件联系 Lawted</BasicLink>。</p>
        <p className="department-disclosure">{service.disclosure}</p>
      </section>
    </main>
  );
}
