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
  express: "Em breve — templates atualmente só Hono ou Next como backend.",
  fastify: "Em breve — use Hono até termos scaffolding.",
  elysia: "Em breve — use Bun + Hono no gerador até termos scaffold Elysia.",

  // Runtime
  bun: "Runtime JS mais rápido · TS nativo",
  node: "Estável · universal",
  workers: "V8 isolates · edge do Cloudflare",

  // API
  orpc: "Type-safe · OpenAPI-first",
  trpc: "Em breve — oRPC já vem integrado aos templates gerados.",
  rest: "Em breve — use o fluxo oRPC/OpenAPI atual do stack.",
  // DB
  postgres: "SQL · ACID · primeira escolha",
  mysql: "Em breve com Drizzle nos templates — Postgres/SQLite hoje.",
  sqlite: "Embedded · arquivo local",
  mongodb: "Document · schemaless",

  // ORM
  drizzle: "TS-native · SQL-like · leve",
  prisma: "Schema-first · migrations · studio",
  mongoose: "Em breve — Drizzle ou Prisma no gerador hoje.",

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
  clerk: "Em breve — Better Auth já vem ligado aos handlers do gerador.",

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
