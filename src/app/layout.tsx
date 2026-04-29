import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ha7ch.com"),
  title: "HA7CH",
  description: "A tiny builder lab hatching vibe-coded products.",
  icons: {
    icon: "/ha7ch.svg",
    shortcut: "/ha7ch.svg",
    apple: "/ha7ch.svg"
  },
  openGraph: {
    title: "HA7CH",
    description: "A tiny builder lab hatching vibe-coded products.",
    url: "https://ha7ch.com",
    siteName: "HA7CH",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "HA7CH",
    description: "A tiny builder lab hatching vibe-coded products."
  }
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
      <body>{children}</body>
    </html>
  );
}
