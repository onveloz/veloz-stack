/** Display labels and hints for stack axes — shared by web picker and CLI. */

/** Title-cases an axis id for display (`tanstack-start` → `Tanstack Start`). */
export function titleCase(s: string): string {
  if (s === "none") {
    return "Nenhum";
  }
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/** Human label for a {@link FrontendId} value. */
export function labelsFrontend(id: string): string {
  const map: Record<string, string> = {
    "tanstack-start": "TanStack Start",
    next: "Next.js",
    nuxt: "Nuxt",
    "svelte-kit": "SvelteKit",
    astro: "Astro",
    none: "Nenhum",
  };
  return map[id] ?? titleCase(id);
}

/** Human label for a {@link BackendId} value. */
export function labelsBackend(id: string): string {
  const map: Record<string, string> = {
    hono: "Hono",
    next: "Route Handlers",
    express: "Express",
    fastify: "Fastify",
    elysia: "Elysia",
    none: "Nenhum",
  };
  return map[id] ?? titleCase(id);
}

/** Human label for a {@link UiId} value. */
export function labelsUi(id: string): string {
  const map: Record<string, string> = {
    shadcn: "shadcn/ui",
    tailwind: "Tailwind 4",
    none: "Nenhum",
  };
  return map[id] ?? titleCase(id);
}

/** Human label for a {@link DbHostingId} value. */
export function labelsDbHost(id: string): string {
  const map: Record<string, string> = {
    veloz: "Veloz",
    neon: "Neon",
    supabase: "Supabase",
    planetscale: "PlanetScale",
    turso: "Turso",
    "mongodb-atlas": "MongoDB Atlas",
    docker: "Docker (local)",
    none: "Nenhum",
  };
  return map[id] ?? titleCase(id);
}

/** Human label for a {@link DeployId} value. */
export function labelsDeploy(id: string): string {
  const map: Record<string, string> = {
    veloz: "Veloz",
    vercel: "Vercel",
    cloudflare: "Cloudflare",
    fly: "Fly.io",
    render: "Render",
    docker: "Docker",
    none: "Nenhum",
  };
  return map[id] ?? titleCase(id);
}

/** Human label for an {@link AuthId} value. */
export function labelsAuth(id: string): string {
  const map: Record<string, string> = {
    "better-auth": "Better Auth",
    clerk: "Clerk",
    none: "Nenhuma",
  };
  return map[id] ?? titleCase(id);
}

/** Human label for an {@link ApiId} value. */
export function labelsApi(id: string): string {
  if (id === "orpc") {
    return "oRPC";
  }
  if (id === "trpc") {
    return "tRPC";
  }
  return titleCase(id);
}

/** Display metadata for monorepo addons in the picker. */
export const ADDON_META = {
  turborepo: { label: "Turborepo", tagline: "Task graph + cache remoto" },
  biome: { label: "Biome", tagline: "Format + lint" },
  husky: {
    label: "Husky + lint-staged",
    tagline: "Legado na UI — prefira Lefthook (ou ?showLegacy=1)",
  },
  oxlint: { label: "oxlint + oxfmt", tagline: "Alternativa ao Biome" },
  lefthook: {
    label: "Lefthook",
    tagline: "Hooks Git recomendados (YAML, rápidos)",
  },
} as const satisfies Record<string, { label: string; tagline: string }>;

/** Display labels for optional example apps in the stack builder. */
export const EXAMPLE_META = {
  todo: { label: "Todo CRUD", tagline: "oRPC + Drizzle + frontend" },
  "ai-chat": { label: "Chat IA (em breve)", tagline: "Streaming via Claude" },
  "pix-checkout": { label: "Checkout PIX", tagline: "AbacatePay + webhook" },
} as const satisfies Record<string, { label: string; tagline: string }>;

/** Short helper text for axis values in the stack builder. */
export const OPTION_HINTS: Record<string, string> = {
  "tanstack-start": "Rotas por arquivo · Vite SSR",
  next: "App Router · RSC · nativo do Vercel",
  nuxt: "Vue · SSR · Nitro",
  "svelte-kit": "Svelte 5 · SSR",
  astro: "Islands · focado em conteúdo",
  none: "Sem UI — só API",
  expo: "React Native · expo-router · OTA updates",
  tauri: "Rust + WebView nativo · empacota o frontend web",
  hono: "Ultra-rápido · padrões web · roda em edge",
  express: "Em breve — templates atualmente só Hono ou Next como backend.",
  fastify: "Em breve — use Hono até termos scaffolding.",
  elysia: "Em breve — use Bun + Hono no gerador até termos scaffold Elysia.",
  bun: "Runtime JS mais rápido · TS nativo",
  node: "Estável · universal",
  workers: "V8 isolates · edge do Cloudflare",
  orpc: "Type-safe · OpenAPI-first",
  trpc: "Em breve — oRPC já vem integrado aos templates gerados.",
  rest: "Em breve — use o fluxo oRPC/OpenAPI atual do stack.",
  postgres: "SQL · ACID · primeira escolha",
  mysql: "Em breve com Drizzle nos templates — Postgres/SQLite hoje.",
  sqlite: "Embedded · arquivo local",
  mongodb: "Document · schemaless",
  drizzle: "TS-native · SQL-like · leve",
  prisma: "Schema-first · migrations · studio",
  mongoose: "Em breve — Drizzle ou Prisma no gerador hoje.",
  veloz: "Postgres/MySQL gerenciado · em pt-BR",
  neon: "Postgres serverless · branching",
  supabase: "Postgres + auth + storage",
  planetscale: "MySQL serverless · branching",
  turso: "SQLite no edge · libSQL",
  "mongodb-atlas": "MongoDB gerenciado",
  docker: "Compose local · sem cloud",
  "better-auth": "OSS · você controla os tokens",
  clerk: "Em breve — Better Auth já vem ligado aos handlers do gerador.",
  vercel: "Zero-config · URLs de preview",
  cloudflare: "Edge-first · Workers + Pages",
  fly: "Regiões perto dos seus usuários",
  render: "PaaS simples · tem free tier",
  pnpm: "Workspaces nativos · eficiente",
  npm: "Universal · não precisa instalar nada",
  shadcn: "shadcn/ui · Tailwind 4 · oklch · componentes prontos",
  tailwind: "Tailwind 4 puro · sem componentes",
};

const SECTION_HINTS: Partial<Record<string, Partial<Record<string, string>>>> =
  {
    backend: {
      next: "APIs nativas no App Router (/app/api) · same-origin · sem apps/server",
    },
    deploy: {
      veloz: "Deploy opinado · npx onveloz deploy · Dockerfile + health checks",
    },
    dbHosting: {
      veloz:
        "Recomendado no stack Veloz BR — Postgres/MySQL gerenciado em pt-BR",
    },
  };

/** Resolves a hint for an axis value, optionally scoped to a section (e.g. `backend`). */
export function getOptionHint(
  id: string,
  section?: string,
): string | undefined {
  if (section) {
    return SECTION_HINTS[section]?.[id] ?? OPTION_HINTS[id];
  }
  return OPTION_HINTS[id];
}
