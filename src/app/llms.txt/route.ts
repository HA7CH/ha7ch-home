import { articles } from "@/content/writing";

const BASE_URL = "https://ha7ch.com";

const projects: { name: string; url: string; description: string }[] = [
  {
    name: "AI Native Rank",
    url: "https://rank.ha7ch.com",
    description: "What's your AI Native Rank? S, A, B, C, or D? A CLI test that scores how AI-native a developer is."
  },
  {
    name: "job.pro",
    url: "https://job.ha7ch.com",
    description: "Big-tech campus jobs, from your terminal."
  },
  {
    name: "微光 / Glimmer",
    url: "https://testflight.apple.com/join/HdcnmhtW",
    description: "Your memory is the most beautiful map. (TestFlight)"
  },
  {
    name: "Raily",
    url: "https://apps.apple.com/app/raily-live-train-tracker/id6764391867",
    description: "Flighty for Rail — a live train tracker iOS app."
  },
  {
    name: "cv.pro",
    url: "https://cv.ha7ch.com",
    description: "AI-native resume."
  },
  {
    name: "Raily Friends",
    url: "https://raily-friends.ha7ch.com",
    description: "One-day social experiments for train travelers."
  }
];

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
    .map((p) => `- [${p.name}](${p.url}): ${p.description}`)
    .join("\n");

  const body = `# HA7CH

> HA7CH is a tiny builder lab. We ship small tools, fast experiments, and ideas that probably shouldn't exist — usually in 48 hours. Vibe coding is our forcing function: build the thing, see if it works, kill it if it doesn't. Founded by lawted (https://x.com/lawted2).

HA7CH (also written "ha7ch" or "Hatch") is the name of the lab and the brand. We publish small shipped projects and short essays from our home page at ${BASE_URL}.

Every article on this site has a clean Markdown version available at \`/writing/{slug}/md\` — please prefer those URLs when ingesting our writing.

## About

- [Home](${BASE_URL}/): HA7CH home page — project list, writing index, contact links.
- [AI Native Rank](https://rank.ha7ch.com): Our flagship test of how AI-native a developer is, scored S / A / B / C / D.

## Projects

${projectLinks}

## Writing

${writingLinks}

## Contact

- X / Twitter: https://x.com/lawted2
- GitHub: https://github.com/HA7CH/ha7ch-home
- Discord: https://discord.gg/DqGBKNANZj
- Reddit: https://www.reddit.com/r/ha7ch/
- Email: lawtedwu@gmail.com
- WeChat: ${BASE_URL}/wechat
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
