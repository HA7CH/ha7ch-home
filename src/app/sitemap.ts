import type { MetadataRoute } from "next";
import { articles } from "@/content/writing";

const BASE_URL = "https://ha7ch.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0
    },
    {
      url: `${BASE_URL}/wechat`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${BASE_URL}/rednote`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4
    }
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/writing/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "yearly",
    priority: 0.7
  }));

  return [...staticRoutes, ...articleRoutes];
}
