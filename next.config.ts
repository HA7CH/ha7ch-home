import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Products
      { source: "/r", destination: "https://apps.apple.com/app/raily-live-train-tracker/id6764391867", permanent: false },

      // Writing
      { source: "/qei", destination: "/writing/question-every-instinct", permanent: false },
      { source: "/wtl", destination: "/writing/walk-on-two-legs", permanent: false },
      { source: "/wtf", destination: "/writing/we-dont-know-what-ha7ch-is-yet", permanent: false },
      { source: "/fde", destination: "/writing/fde-is-the-future", permanent: false },
      { source: "/mvp", destination: "/writing/mvp-as-research", permanent: false },
      { source: "/ztd", destination: "/writing/zero-token-design", permanent: false },
    ];
  },
};

export default nextConfig;
