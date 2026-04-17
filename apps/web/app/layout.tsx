import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veloz Stack — Opinionated TypeScript scaffolder for Brazil",
  description:
    "Bun · Hono · oRPC · TanStack Start · Better Auth · Drizzle. Batteries-included for Brazil: PIX, SMS, LGPD, Claude-ready. Deploys to Veloz.",
  metadataBase: new URL("https://veloz-stack.dev"),
  openGraph: {
    title: "Veloz Stack",
    description: "Opinionated full-stack TypeScript scaffolder — 100% deployable on Veloz",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap"
        />
      </head>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
