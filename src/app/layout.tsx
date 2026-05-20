import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ha7ch.com"),
  title: {
    default: "HA7CH: AI-native Builder Lab born at Stanford, the world's first FDE Accelerator",
    template: "%s · HA7CH"
  },
  description:
    "HA7CH is an AI-native Builder Lab born at Stanford. The world's first FDE Accelerator. Build in the field, hatch into impact.",
  applicationName: "HA7CH",
  keywords: [
    "HA7CH",
    "ha7ch",
    "Hatch",
    "AI-native Builder Lab",
    "Builder Lab",
    "FDE Accelerator",
    "Forward Deployed Engineer",
    "Stanford",
    "vibe coding",
    "AI native",
    "AI Native Rank",
    "Claude Code",
    "AI agents",
    "Raily",
    "cv.pro",
    "job.pro",
    "Glimmer",
    "lawted"
  ],
  authors: [{ name: "lawted", url: "https://x.com/lawted2" }],
  creator: "lawted",
  publisher: "HA7CH",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "HA7CH: AI-native Builder Lab born at Stanford, the world's first FDE Accelerator",
    description:
      "HA7CH is an AI-native Builder Lab born at Stanford. The world's first FDE Accelerator. Build in the field, hatch into impact.",
    url: "https://ha7ch.com",
    siteName: "HA7CH",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "HA7CH: AI-native Builder Lab born at Stanford, the world's first FDE Accelerator",
    description:
      "AI-native Builder Lab born at Stanford. World's first FDE Accelerator. Build in the field, hatch into impact.",
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
