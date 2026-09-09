import { companyMarkdown } from "@/content/company";
import { events, projects } from "@/content/catalog";
import { articles, getArticle } from "@/content/writing";
import { infoMarkdown, siteInfo } from "@/content/site-info";
import { diagnosis, executiveCamp } from "@/content/services";

export function supportsMarkdown(path: string) {
  return path === "/" || Object.hasOwn(siteInfo, path.slice(1)) || [diagnosis.href, executiveCamp.href].includes(path) || /^\/writing\/[^/]+(?:\/zh)?$/.test(path);
}
export function siteMarkdown(path: string): string | undefined {
  if (path === "/") return `# HA7CH\n\n${companyMarkdown()}\n\n` + [
    `## Events\n\n${events.map(e => `- [${e.title}](${e.href}): ${e.schedule} · ${e.meta}`).join("\n")}`,
    `## Projects\n\n${projects.filter(p => !p.dead && p.href).map(p => `- [${p.title}](${p.href}): ${p.description ?? ""}`).join("\n")}`,
    `## Writing\n\n${articles.map(a => `- [${a.titleEn}](https://ha7ch.com/writing/${a.slug}.md)`).join("\n")}`,
    `## Information\n\n${Object.entries(siteInfo).map(([slug,p]) => `- [${p.title}](https://ha7ch.com/${slug}.md)`).join("\n")}`
  ].join("\n\n") + "\n";
  const info = infoMarkdown(path.slice(1));
  if (info) return info;
  const service = [diagnosis, executiveCamp].find(s => s.href === path);
  if (service) return `# ${service.title}\n\n${service.subtitle}\n\n${service.introduction}\n\n${service.summary}\n\n` + service.plans.map(p => `## ${p.title}\n\n${p.meta}\n\n${p.description}`).join("\n\n") + "\n\n" + service.sections.map(s => `## ${s.title}\n\n${s.intro ?? ""}\n\n${s.items.map(i => `### ${i.title}\n\n${i.description}`).join("\n\n")}`).join("\n\n") + `\n\n${service.disclosure}\n\n[Skill source](${service.github})\n\n[Contact HA7CH](https://ha7ch.com/contact)\n`;
  const match = path.match(/^\/writing\/([^/]+)(\/zh)?$/);
  if (match) {
    const article = getArticle(match[1]);
    if (!article) return undefined;
    return `# ${match[2] ? article.titleZh : article.titleEn}\n\n> Published ${article.date} · By Lawted · HA7CH\n\n${(match[2] ? article.zh : article.en).join("\n\n")}\n`;
  }
}
