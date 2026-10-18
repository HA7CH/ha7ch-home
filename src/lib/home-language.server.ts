import Negotiator from "negotiator";
import type { HomeLanguage } from "./home-language";

/** Resolve from the existing page request; no geolocation or other fetch. */
export function resolveHomeLanguage({
  requested,
  saved,
  acceptLanguage
}: {
  requested?: string | string[];
  saved?: string;
  acceptLanguage?: string | null;
}): HomeLanguage {
  if (requested === "en" || requested === "zh") return requested;
  if (saved === "en" || saved === "zh") return saved;

  // Reuse the existing server dependency for language tags and q-values.
  // Chinese is the fallback for missing/unsupported preferences and wildcards.
  const language = new Negotiator({
    headers: { "accept-language": acceptLanguage ?? "" }
  }).language(["zh", "en"]);
  return language === "en" ? "en" : "zh";
}
