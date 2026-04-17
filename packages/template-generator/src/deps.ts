/**
 * Single source of truth for every dependency version the generator can
 * emit. Throws if you ever try to add a package not in the map — prevents
 * rogue versions creeping into generated projects.
 */
export const DEPENDENCY_VERSIONS = {
  // Core runtime / build
  typescript: "^5.6.3",
  tsx: "^4.19.2",
  vitest: "^3.2.4",
  "@types/node": "^22.13.14",

  // Backend
  hono: "^4.8.2",
  "@hono/node-server": "^1.14.0",

  // API layer
  "@orpc/server": "^1.12.2",
  "@orpc/client": "^1.12.2",
  "@orpc/zod": "^1.12.2",

  // Auth
  "better-auth": "^1.4.18",

  // ORM / DB
  "drizzle-orm": "^0.36.0",
  "drizzle-kit": "^0.28.0",
  postgres: "^3.4.5",
  prisma: "^6.19.3",
  "@prisma/client": "^6.19.3",

  // Validation
  zod: "^3.23.8",

  // Frontend (TanStack Start)
  "@tanstack/react-start": "^1.87.0",
  "@tanstack/react-router": "^1.87.0",
  react: "^19.0.0",
  "react-dom": "^19.0.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  vite: "^6.0.0",
  "@vitejs/plugin-react": "^4.3.4",

  // Modules — BR SaaS
  "abacatepay-nodejs-sdk": "^1.6.0",
  "@ararahq/sdk": "^1.8.0",

  // Modules — global
  "@anthropic-ai/sdk": "^0.32.0",
  resend: "^6.12.0",
  "posthog-node": "^4.3.0",
  "@sentry/node": "^8.47.0",
} as const satisfies Record<string, string>;

export type DependencyName = keyof typeof DEPENDENCY_VERSIONS;

export function version(name: DependencyName): string {
  const v = DEPENDENCY_VERSIONS[name];
  if (!v) {
    throw new Error(
      `Dependency "${name}" not in central version map. Add it to packages/template-generator/src/deps.ts first.`,
    );
  }
  return v;
}
