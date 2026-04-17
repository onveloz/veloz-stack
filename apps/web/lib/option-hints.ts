export const OPTION_HINTS: Record<string, string> = {
  // Frontend
  "tanstack-start": "File routes · Vite SSR",
  next: "App Router · RSC · Vercel-native",
  nuxt: "Vue · SSR · Nitro",
  "svelte-kit": "Svelte 5 · SSR",
  astro: "Islands · content-heavy",
  "native-expo": "React Native · OTA updates",
  none: "No UI — API-only",

  // Backend
  hono: "Ultra-fast · Web-standards · edge-ready",
  express: "Battle-tested Node classic",
  fastify: "Low-overhead · schema-validated",
  elysia: "Bun-native · end-to-end types",

  // Runtime
  bun: "Fastest JS runtime · native TS",
  node: "Stable · universal",
  workers: "V8 isolates · Cloudflare edge",

  // API
  orpc: "Type-safe · OpenAPI-first",
  trpc: "Type-safe · RPC-first",
  rest: "Plain REST · OpenAPI optional",

  // DB
  postgres: "SQL · ACID · first choice",
  mysql: "SQL · widely hosted",
  sqlite: "Embedded · file-based",
  mongodb: "Document · schemaless",

  // ORM
  drizzle: "TS-native · SQL-like · light",
  prisma: "Schema-first · migrations · studio",
  mongoose: "MongoDB-only ODM",

  // DB hosting
  veloz: "Managed Postgres/MySQL em pt-BR",
  neon: "Serverless Postgres · branching",
  supabase: "Postgres + auth + storage",
  planetscale: "Serverless MySQL · branching",
  turso: "Edge SQLite · libSQL",
  "mongodb-atlas": "Managed MongoDB",
  docker: "Local compose · no cloud",

  // Auth
  "better-auth": "OSS · own the tokens",
  clerk: "Hosted · drop-in UI",

  // Deploy
  vercel: "Zero-config · preview URLs",
  cloudflare: "Edge-first · Workers + Pages",
  fly: "Regions close to your users",
  render: "Simple PaaS · free tier",

  // PM
  pnpm: "Workspace-native · efficient",
  npm: "Universal · no extra install",
};

export function getHint(id: string): string | undefined {
  return OPTION_HINTS[id];
}
