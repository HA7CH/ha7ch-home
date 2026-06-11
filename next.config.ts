import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
