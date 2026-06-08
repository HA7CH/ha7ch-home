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
      url: `${BASE_URL}/event`,
      lastModified: now,
      changeFrequency: "monthly",
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

  const articleRoutes: MetadataRoute.Sitemap = articles.flatMap((a) => {
    const enUrl = `${BASE_URL}/writing/${a.slug}`;
    const zhUrl = `${enUrl}/zh`;
    const languages = {
      "en-US": enUrl,
      "zh-CN": zhUrl,
      "x-default": enUrl
    };

    return [
      {
        url: enUrl,
        lastModified: new Date(a.date),
        changeFrequency: "yearly" as const,
        priority: 0.7,
        alternates: { languages }
      },
      {
        url: zhUrl,
        lastModified: new Date(a.date),
        changeFrequency: "yearly" as const,
        priority: 0.7,
        alternates: { languages }
      },
      {
        url: `${enUrl}/md`,
        lastModified: new Date(a.date),
        changeFrequency: "yearly" as const,
        priority: 0.5
      }
    ];
  });

  return [...staticRoutes, ...articleRoutes];
}
