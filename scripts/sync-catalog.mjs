// Read-only upstream sync. Only explicitly selected public fields enter the website.
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const site = "https://mee7.ha7ch.com";
const excluded = new Set(["adventurex", "s26-onboard"]);
const publicRepos = new Set([
  "ha7ch-school", "anc-fde-camp", "anc-diagnosis", "anc-executive-camp", "anc-transcribe-audio", "cv-pro",
  "fde-playground", "geng-pro", "ha7ch-stanford", "ai-native-company"
]);

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Catalog source returned HTTP ${response.status}: ${new URL(url).pathname}`);
  return response;
}

function decode(text) {
  return text.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

async function eventDetails(event) {
  // A public landing page must exist; hidden events fail this check.
  const href = `${site}/e/${encodeURIComponent(event.event_id)}`;
  const response = await request(href);
  const html = await response.text();
  const json = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => { try { return JSON.parse(match[1]); } catch { return null; } })
    .find((item) => item?.["@type"] === "Event");
  if (!json || typeof json.name !== "string") throw new Error(`Missing public Event metadata: ${event.event_id}`);
  return {
    id: event.event_id,
    title: json.name,
    description: decode(String(json.description ?? "")),
    time: String(event.time_info ?? ""),
    date: event.start_at > 0 ? new Date(event.start_at + 8 * 3600000).toISOString().slice(0, 10) : null,
    status: event.status,
    href
  };
}

let token = process.env.MEE7_TOKEN;
if (!token) {
  try { token = JSON.parse(await readFile(join(homedir(), ".mee7/config.json"), "utf8")).token; }
  catch { /* A missing credential is reported without revealing local config. */ }
}
if (!token) throw new Error("Connect the mee7 CLI first, or set MEE7_TOKEN for catalog sync.");
const rpc = await (await request(`${site}/api/mcp`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_events", arguments: {} } })
})).json();
if (rpc.error || rpc.result?.isError) throw new Error("mee7 list_events failed.");
const rows = JSON.parse(rpc.result.content.filter((item) => item.type === "text").map((item) => item.text).join("\n"));
if (!Array.isArray(rows)) throw new Error("Invalid mee7 event list.");
const candidates = rows.filter((event) =>
  ["open", "closed"].includes(event.status) &&
  /^[a-z0-9-]+$/.test(event.event_id) &&
  /ha7ch|hcn|fde/i.test(event.name) &&
  !excluded.has(event.event_id) &&
  !/test|onboard|测试|现场进组/i.test(`${event.event_id} ${event.name}`)
);
const events = [];
for (let i = 0; i < candidates.length; i += 4) {
  // Fail atomically on upstream errors, keeping the last verified catalog intact.
  events.push(...await Promise.all(candidates.slice(i, i + 4).map(eventDetails)));
}
const repos = await (await request("https://api.github.com/orgs/HA7CH/repos?type=public&per_page=100", {
  headers: { accept: "application/vnd.github+json", "user-agent": "ha7ch-home-catalog" }
})).json();
if (!Array.isArray(repos)) throw new Error("Invalid GitHub public repository list.");
const projects = repos.filter((repo) => !repo.private && !repo.archived && publicRepos.has(repo.name))
  .map((repo) => ({
    id: repo.name, title: repo.name, description: repo.description ?? "",
    href: repo.html_url, website: repo.homepage || null,
    updatedAt: repo.pushed_at.slice(0, 10)
  }));
for (const name of publicRepos) {
  if (!projects.some((project) => project.id === name)) throw new Error(`Public project not found: ${name}`);
}
const syncedAt = new Date().toISOString();
const result = { syncedAt, eventsSyncedAt: syncedAt, events, projects };
await writeFile(new URL("src/content/catalog.generated.json", root), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Synced ${events.length} public mee7 events and ${projects.length} public GitHub projects.`);
