import { articles } from "@/content/writing";
import { company, companyMarkdown } from "@/content/company";
import { events, projects } from "@/content/catalog";

const BASE_URL = "https://ha7ch.com";

export function GET() {
  const writingLinks = articles
    .map((a) => {
      const url = `${BASE_URL}/writing/${a.slug}`;
      const title =
        a.titleEn === a.titleZh ? a.titleEn : `${a.titleEn} / ${a.titleZh}`;
      const desc = a.description ?? "";
      const suffix = desc ? `: ${desc}` : "";
      return `- [${title}](${url}.md)${suffix}`;
    })
    .join("\n");

  const projectLinks = projects
    .filter((p) => p.href && p.title && !p.dead)
    .map((p) => `- [${p.title}](${p.href}): ${p.description}`)
    .join("\n");

  const body = `# HA7CH

> ${company.description}

HA7CH (also written "ha7ch" or "Hatch") works with enterprises, FDEs and creators to build AI Native Companies. Our home page is ${BASE_URL}.

${companyMarkdown()}

Every article on this site has a clean Markdown version available at \`/writing/{slug}/md\` — please prefer those URLs when ingesting our writing.

## About

- [Home](${BASE_URL}/): HA7CH company, events, projects and writing.
- [Academy](${BASE_URL}/academy): HA7CH School, FDE Camp and the executive AI strategy camp.
- [Executive AI Camp](${BASE_URL}/academy/executive-ai-camp): Two-day program for the decision-maker and execution lead; GitHub Skill at https://github.com/HA7CH/anc-executive-camp.
- [ANC-Diagnosis](${BASE_URL}/hdc/diagnosis): Five-day enterprise field diagnosis; GitHub Skill at https://github.com/HA7CH/anc-diagnosis.
- [HCN](${BASE_URL}/hcn): Creator network and first-cohort application.
- [ANC Fund](${BASE_URL}/anc-fund): S26 company discovery and application.
- [HDC](${BASE_URL}/hdc): Enterprise AI diagnosis and deployment.
- [AI Native Rank](https://rank.ha7ch.com): Our flagship test of how AI-native a developer is, scored S / A / B / C / D.

## Events

${events.map((event) => `- [${event.title}](${event.href}): ${event.schedule} · ${event.meta}. ${event.description}`).join("\n")}

## Projects

${projectLinks}

## Writing

${writingLinks}

## Contact

- WeChat official account: ${BASE_URL}/wechat

- X / Twitter: https://x.com/lawted2
- GitHub: https://github.com/HA7CH/ha7ch-home
- Discord: https://discord.gg/DqGBKNANZj
- Reddit: https://www.reddit.com/r/ha7ch/
- Email: lawtedwu@gmail.com
- RedNote (小红书): ${BASE_URL}/rednote
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all"
    }
  });
}
