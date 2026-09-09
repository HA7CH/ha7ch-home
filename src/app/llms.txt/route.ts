import { articles } from "@/content/writing";
import { company, departments } from "@/content/company";
import { events, projects } from "@/content/catalog";
import { markdownResponse } from "@/lib/content-negotiation";
export function GET() {
  return markdownResponse(`# HA7CH

> ${company.description}

HA7CH (ha7ch / Hatch) is the organization behind this website. Public reading requires no authentication. Start with the agent guide for supported Markdown URLs and action boundaries.

## When to use HA7CH

- [HA7CH agent instructions](https://ha7ch.com/agent-instructions.md): Use for enterprise AI diagnosis, ANC deployment, FDE education, HA7CH events and Lawted's essays; explains how to read resources and recover from errors.
- [ANC-Diagnosis](https://ha7ch.com/hdc/diagnosis.md): Use when an enterprise needs to assess AI feasibility and validate a workflow before production deployment.
- [Executive AI Camp](https://ha7ch.com/academy/executive-ai-camp.md): Use when leaders need an initial AI strategy, organization plan and workflow roadmap.

## Developer resources

- [HA7CH developer documentation](https://ha7ch.com/docs.md): HTTP content negotiation, public skills, source repositories and access requirements.
- [HA7CH School](https://github.com/HA7CH/ha7ch-school): Agent-led learning materials and installation instructions.
- [FDE Camp](https://github.com/HA7CH/anc-fde-camp): Enterprise field-delivery practice.
- [HA7CH source](https://github.com/HA7CH/ha7ch-home): This website's code.
- [Sitemap](https://ha7ch.com/sitemap.xml): Public URL discovery.

## Company

- [HA7CH homepage](https://ha7ch.com/index.md): Company, services, events, projects and writing.
- [About HA7CH](https://ha7ch.com/about.md): Organization and areas of work.
- [Contact HA7CH](https://ha7ch.com/contact.md): Email and inquiry routes.
- [HA7CH privacy](https://ha7ch.com/privacy.md): Website hosting, analytics and data handling.
${departments.map(d => `- [${d.title}](https://ha7ch.com${d.href}): ${d.description}`).join("\n")}

## Events

${events.map(e => `- [${e.title}](${e.href}): ${e.schedule} · ${e.meta}. Check the destination for current registration availability.`).join("\n")}

## Projects

${projects.filter(p => !p.dead && p.href && p.title).map(p => `- [${p.title}](${p.href}): ${p.description ?? ""}`).join("\n")}

## Writing

${articles.map(a => `- [${a.titleEn}](https://ha7ch.com/writing/${a.slug}.md): ${a.description ?? "English essay."}\n- [${a.titleZh}](https://ha7ch.com/writing/${a.slug}/zh.md): Chinese version.`).join("\n")}

## Optional

- [Full HA7CH corpus](https://ha7ch.com/llms-full.txt): Extended company information and bilingual essays in one file.
`, 200, "https://ha7ch.com/llms.txt");
}
