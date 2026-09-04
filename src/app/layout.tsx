import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { company } from "@/content/company";

export const metadata: Metadata = {
  metadataBase: new URL("https://ha7ch.com"),
  title: {
    default: company.title,
    template: "%s · HA7CH"
  },
  description: company.description,
  applicationName: "HA7CH",
  keywords: [
    "HA7CH",
    "ha7ch",
    "Hatch",
    "AI Native Company",
    "ANC",
    "HCN",
    "HDC",
    "HA7CH Academy",
    "ANC Fund",
    "企业 AI 转型",
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
    title: company.title,
    description: company.description,
    url: "https://ha7ch.com",
    siteName: "HA7CH",
    type: "website",
    locale: "zh_CN"
  },
  twitter: {
    card: "summary_large_image",
    title: company.title,
    description: company.description,
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
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfdfc" },
    { media: "(prefers-color-scheme: dark)", color: "#101010" }
  ],
  colorScheme: "light dark"
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
