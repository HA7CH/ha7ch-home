import { infoMarkdown } from "@/content/site-info";
import { markdownResponse } from "@/lib/content-negotiation";
export function GET() { return markdownResponse(infoMarkdown("docs")!, 200, "https://ha7ch.com/docs"); }
