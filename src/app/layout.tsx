import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ha7ch.com"),
  title: {
    default: "HA7CH — a tiny builder lab shipping vibe-coded products in 48 hours",
    template: "%s · HA7CH"
  },
  description:
    "HA7CH is a tiny builder lab. We ship small tools, fast experiments, and ideas that probably shouldn't exist — usually in 48 hours. Vibe coding is our forcing function.",
  applicationName: "HA7CH",
  keywords: [
    "HA7CH",
    "ha7ch",
    "vibe coding",
    "AI native",
    "AI Native Rank",
    "builder lab",
    "indie hackers",
    "Claude Code",
    "AI agents",
    "Raily",
    "cv.pro",
    "job.pro",
    "Glimmer",
    "lawted",
    "48 hour build",
    "FDE"
  ],
  authors: [{ name: "lawted", url: "https://x.com/lawted2" }],
  creator: "lawted",
  publisher: "HA7CH",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "HA7CH — a tiny builder lab shipping vibe-coded products in 48 hours",
    description:
      "Small tools, fast experiments, and ideas that probably shouldn't exist. Vibe coding is our forcing function. Build the thing. See if it works. Kill it if it doesn't.",
    url: "https://ha7ch.com",
    siteName: "HA7CH",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "HA7CH — a tiny builder lab shipping vibe-coded products in 48 hours",
    description:
      "Small tools, fast experiments, ideas that probably shouldn't exist — usually in 48 hours.",
    site: "@lawted2",
    creator: "@lawted2"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  category: "technology"
};

export const viewport: Viewport = {
  themeColor: "#f7f5ef",
  colorScheme: "light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
