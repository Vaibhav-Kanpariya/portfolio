import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted variable Archivo (weight 100–900, width 62–125%).
// Self-hosting keeps builds independent of Google Fonts being reachable.
const archivo = localFont({
  src: "../fonts/archivo-latin-wdth-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-archivo",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const metadata: Metadata = {
  title: "Vaibhav Kanpariya | Full stack engineer, agentic systems",
  description:
    "I build autonomous AI agents and the event-driven backends that keep them reliable in production. Explore my work as a 3D map, or open the recruiter view.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#060a18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} antialiased`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
