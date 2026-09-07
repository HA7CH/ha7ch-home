import type { ListItem } from "@/components/PostList";
import snapshot from "./catalog.generated.json";
import { legacyProjects } from "./projects-legacy";

// Editorial summaries are deliberately separate from upstream facts and registration state.
const eventCopy: Record<string, { title?: string; description: string; date?: string }> = {
  "shanghai-fde-night-2026": { title: "Shanghai FDE Night · HA7CH × PROPELLER", description: "面向正在做企业 AI、FDE 与现场交付的人。与 PROPELLER 联合呈现，由 Alibaba 千问办公支持，参与免费并含餐饮。" },
  "beijing-fde-pro": { title: "FDE PRO S26 · Beijing", description: "已举办，311 人到场。围绕个人如何成为 FDE、组织为什么需要 FDE 交流；现场纪要与 PPT 见活动详情。", date: "2026-09-05" },
  "fde-sprint": { title: "48H FDE Sprint", description: "进入真实企业，访谈一线、梳理工作流，在两个完整工作日里做出可演示、可验证的 AI MVP。申请后进入候选池，每场单独确认档期。" },
  "hcn-creator-pilot-01": { description: "首期邀请 10 位长期分享 AI 的创作者，连续共创 30 天。把一手信息、真实案例与自己的实践，做成有用的文章、视频、直播或帖子。" },
  "anc-fund-s26": { description: "面向创业者与正在服务企业的 FDE。带着公司、BP 或企业改造案例来，介绍真实业务、验证结果和希望获得的支持。" },
  "fde-pro-s26": { title: "FDE PRO S26 · 全国 FDE 专家交流大会", description: "在国家人工智能应用中试基地举办，聚焦 FDE 与企业 AI 落地。通过真实案例分享和现场交流，讨论从业务问题到交付的实践。" },
  "sf-fde-2026": { title: "San Francisco #005 · AI Native Builder Meetup", description: "与 intent.app 联合主办。湾区的 AI 产品、Agent 与企业交付实践者围坐交流，交换一线经验。", date: "2026-07-18" },
  "guild-up-001": { title: "Guildup #001 · 四城连线", description: "北京、上海、杭州、深圳的 Meetup 老朋友同晚聚餐，四地线上连线，聊聊相识之后的新进展。", date: "2026-07-04" },
  "beijing-fde-2026": { title: "Beijing #004 · FDE Meetup", description: "工程、产品与业务实践者共坐一桌，交流如何走进客户现场、拆清模糊需求，把业务问题推进到能被验证。", date: "2026-07-04" },
  "hangzhou-fde-2026": { title: "Hangzhou #003 · FDE Meetup", description: "围绕 FDE 落地与 AI Native 工作方式的小规模交流，从正在做的事出发交换经验与问题。", date: "2026-06-27" },
  "shanghai-fde-2026": { title: "Shanghai #002 · FDE Meetup", description: "聊 FDE 如何落地，也聊 AI Native 如何改变工作。让做产品与做业务的人在现场交换具体经验。" },
  "shenzhen-2026": { title: "Shenzhen #001 · FDE Meetup", description: "HA7CH 首场 FDE Meetup。Builder 们线下相聚，分享正在做的项目，建立下一次交流与合作的连接。", date: "2026-06-06" }
};

// Confirmed website archives survive upstream catalog refreshes without changing mee7.
const eventArchives: Record<string, { href: string; updatedAt: string }> = {
  "beijing-fde-pro": { href: "https://mee7.ha7ch.com/e/beijing-fde-pro", updatedAt: "2026-09-07" }
};

function eventStatus(event: typeof snapshot.events[number]) {
  return eventArchives[event.id] ? "closed" : event.status;
}

function eventDate(event: typeof snapshot.events[number]) {
  if (event.date) return event.date;
  const match = event.time.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (match) return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  return eventCopy[event.id]?.date;
}

function eventItem(event: typeof snapshot.events[number]): ListItem {
  const date = eventDate(event);
  const editorial = eventCopy[event.id];
  return {
    title: editorial?.title ?? event.title,
    description: editorial?.description ?? event.description,
    // Completed entries show a stable date, not an old invitation or location notice.
    schedule: eventStatus(event) === "closed" && date ? date.replaceAll("-", ".") : event.time,
    href: eventArchives[event.id]?.href ?? event.href,
    date,
    updatedAt: eventArchives[event.id]?.updatedAt ?? snapshot.syncedAt.slice(0, 10),
    meta: eventStatus(event) === "open" ? "报名中" : "已结束",
    kind: "event"
  };
}

export const events: ListItem[] = [...snapshot.events]
  .sort((a, b) => {
    if (eventStatus(a) !== eventStatus(b)) return eventStatus(a) === "open" ? -1 : 1;
    const ad = eventDate(a), bd = eventDate(b);
    if (eventStatus(a) === "open") {
      if (!ad || !bd) return Number(!ad) - Number(!bd);
      return ad.localeCompare(bd);
    }
    return (bd ?? "").localeCompare(ad ?? "");
  })
  .map((event, index, all) => ({
    ...eventItem(event),
    group: index === 0 || eventStatus(all[index - 1]) !== eventStatus(event) ? (eventStatus(event) === "open" ? "Now" : "Past") : undefined
  }));

export function registrationItem(id: string): ListItem {
  const event = snapshot.events.find((item) => item.id === id);
  if (!event) throw new Error(`Registration missing from verified catalog: ${id}`);
  return { ...eventItem(event), kind: "offering" };
}

const projectCopy: Record<string, { title: string; description: string }> = {
  "anc-diagnosis": { title: "ANC-Diagnosis", description: "了解 HDC 企业 AI 现场诊断、两档方案、五天交付与 ANC 部署路径的公开 Skill。" },
  "anc-executive-camp": { title: "老板 AI 战略营", description: "了解老板课的两天课程、企业双席位、六项成果与 90 天行动计划的公开 Skill。" },
  "anc-fde-camp": { title: "FDE Camp", description: "了解 FDE Camp、ANC 方法、认证与项目匹配的公开 Skill。" },
  "anc-transcribe-audio": { title: "ANC Transcribe Audio", description: "在 Codex 中转写本地音频的开源 Skill。" },
  "ha7ch-school": { title: "HA7CH School", description: "加载即入学。让 Agent 带你学习 AI Native 与 FDE，把真实资料和练习带进对话。" },
  "ai-native-company": { title: "AI Native Company", description: "将团队日常工作沉淀为 Markdown 知识与 Skill 的开源探索。" },
  "ha7ch-stanford": { title: "HA7CH × Stanford", description: "把 CS229、CS231n、CS224n 等公开课程变成可以带学的 Agent 课堂。" },
  "fde-playground": { title: "FDE Playground", description: "货代业务的 FDE 实战擂台：通过对话摸清真实需求，练习现场判断。" },
  "cv-pro": { title: "cv.pro", description: "把 PDF 简历变成可持续更新的个人网站，支持面向目标岗位的定向版本。" },
  "geng-pro": { title: "geng.pro", description: "论文补充数据完整性筛查工具。用统计方法发现值得复核的异常，仅提供预警。" }
};

const connectedProjects: ListItem[] = [...snapshot.projects]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .map((project, index) => ({
    ...projectCopy[project.id],
    href: project.href,
    group: index === 0 ? "Code" : undefined,
    meta: "Source",
    updatedAt: project.updatedAt
  }));

const connectedTitles = new Set(["ha7ch school", "FDE Playground", "cv.pro"]);
const otherProjects = legacyProjects.filter((project) => project.title && !connectedTitles.has(project.title));

export const projects: ListItem[] = [
  ...connectedProjects,
  ...otherProjects.map((project, index) => ({ ...project, group: index === 0 ? "Apps" : project.group === "2025" ? "2025" : undefined }))
];

export const catalogSyncedAt = snapshot.syncedAt;
