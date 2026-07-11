import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The combined OG routes read local font/SVG files at runtime; bundle them
  // into each serverless function so production doesn't 500 on a missing file.
  outputFileTracingIncludes: {
    "/writing/[slug]/og-combined": ["./public/fonts/**", "./public/ha7ch.svg"],
    "/writing/[slug]/en/og-combined": ["./public/fonts/**", "./public/ha7ch.svg"],
    "/writing/[slug]/zh/og-combined": ["./public/fonts/**", "./public/ha7ch.svg"],
  },
  async redirects() {
    // The event system moved out to mee7 (the AI-bouncer event SaaS). Old URLs keep working
    // forever: landing pages, OG cards and pairing links all 301 to the new home.
    return [
      {
        source: "/event",
        destination: "https://mee7.ha7ch.com",
        permanent: true,
      },
      {
        source: "/event/:path*",
        destination: "https://mee7.ha7ch.com/e/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
