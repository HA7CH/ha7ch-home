import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    sitemap: "https://ha7ch.com/sitemap.xml",
    host: "https://ha7ch.com"
  };
}
