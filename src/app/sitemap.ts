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
      url: `${BASE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6
    },
    {
      url: `${BASE_URL}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6
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

  const articleRoutes: MetadataRoute.Sitemap = articles.flatMap((a) => [
    {
      url: `${BASE_URL}/writing/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: "yearly" as const,
      priority: 0.7
    },
    {
      url: `${BASE_URL}/writing/${a.slug}/md`,
      lastModified: new Date(a.date),
      changeFrequency: "yearly" as const,
      priority: 0.5
    }
  ]);

  return [...staticRoutes, ...articleRoutes];
}
