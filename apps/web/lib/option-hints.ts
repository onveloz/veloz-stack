export const OPTION_HINTS: Record<string, string> = {
  // Frontend
  "tanstack-start": "Rotas por arquivo · Vite SSR",
  next: "App Router · RSC · nativo do Vercel",
  nuxt: "Vue · SSR · Nitro",
  "svelte-kit": "Svelte 5 · SSR",
  astro: "Islands · focado em conteúdo",
  none: "Sem UI — só API",

  // Mobile
  expo: "React Native · expo-router · OTA updates",

  // Desktop
  tauri: "Rust + WebView nativo · empacota o frontend web",

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

  // UI
  shadcn: "shadcn/ui · Tailwind 4 · oklch · componentes prontos",
  tailwind: "Tailwind 4 puro · sem componentes",
};

/** Hints when the same option id appears in multiple categories (e.g. frontend vs backend `next`). */
const SECTION_HINTS: Partial<Record<string, Partial<Record<string, string>>>> = {
  backend: {
    next: "APIs nativas no App Router (/app/api) · same-origin · sem apps/server",
  },
  deploy: {
    veloz: "Deploy opinado · npx onveloz deploy · Dockerfile + health checks",
  },
  dbHosting: {
    veloz: "Recomendado no stack Veloz BR — Postgres/MySQL gerenciado em pt-BR",
  },
};

export function getHint(id: string, section?: string): string | undefined {
  if (section) {
    return SECTION_HINTS[section]?.[id] ?? OPTION_HINTS[id];
  }
  return OPTION_HINTS[id];
}
