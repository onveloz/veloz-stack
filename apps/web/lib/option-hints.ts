export const OPTION_HINTS: Record<string, string> = {
  // Frontend
  "tanstack-start": "Rotas por arquivo · Vite SSR",
  next: "App Router · RSC · nativo do Vercel",
  nuxt: "Vue · SSR · Nitro",
  "svelte-kit": "Svelte 5 · SSR",
  astro: "Islands · focado em conteúdo",
  "native-expo": "React Native · updates OTA",
  none: "Sem UI — só API",

  // Backend
  hono: "Ultra-rápido · padrões web · roda em edge",
  express: "Clássico do Node, testado à exaustão",
  fastify: "Overhead baixo · schema-validated",
  elysia: "Nativo do Bun · tipos end-to-end",

  // Runtime
  bun: "Runtime JS mais rápido · TS nativo",
  node: "Estável · universal",
  workers: "V8 isolates · edge do Cloudflare",

  // API
  orpc: "Type-safe · OpenAPI-first",
  trpc: "Type-safe · RPC-first",
  rest: "REST clássico · OpenAPI opcional",

  // DB
  postgres: "SQL · ACID · primeira escolha",
  mysql: "SQL · amplamente suportado",
  sqlite: "Embedded · arquivo local",
  mongodb: "Document · schemaless",

  // ORM
  drizzle: "TS-native · SQL-like · leve",
  prisma: "Schema-first · migrations · studio",
  mongoose: "ODM só pra MongoDB",

  // DB hosting
  veloz: "Postgres/MySQL gerenciado · em pt-BR",
  neon: "Postgres serverless · branching",
  supabase: "Postgres + auth + storage",
  planetscale: "MySQL serverless · branching",
  turso: "SQLite no edge · libSQL",
  "mongodb-atlas": "MongoDB gerenciado",
  docker: "Compose local · sem cloud",

  // Auth
  "better-auth": "OSS · você controla os tokens",
  clerk: "Hospedado · UI pronta",

  // Deploy
  vercel: "Zero-config · URLs de preview",
  cloudflare: "Edge-first · Workers + Pages",
  fly: "Regiões perto dos seus usuários",
  render: "PaaS simples · tem free tier",

  // PM
  pnpm: "Workspaces nativos · eficiente",
  npm: "Universal · não precisa instalar nada",
};

export function getHint(id: string): string | undefined {
  return OPTION_HINTS[id];
}
