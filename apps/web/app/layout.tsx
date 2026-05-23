import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// oxlint-disable-next-line import/no-unassigned-import -- side-effect global styles
import "./globals.css";

export const metadata: Metadata = {
  title: "Veloz Stack — Scaffolder TypeScript opinado pro Brasil",
  description:
    "Bun · Hono · oRPC · TanStack Start · Better Auth · Drizzle. Baterias incluídas pro Brasil: PIX, SMS, LGPD, pronto pro Claude. Deploy no Veloz.",
  metadataBase: new URL("https://www.veloz-stack.com"),
  openGraph: {
    title: "Veloz Stack",
    description:
      "Scaffolder full-stack TypeScript opinado — 100% deployável no Veloz",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
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
