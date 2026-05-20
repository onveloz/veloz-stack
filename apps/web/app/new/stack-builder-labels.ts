/** Shared display labels for stack builder v1 + v2 */

export function titleCase(s: string): string {
  if (s === "none") return "Nenhum";
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

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

export function labelsUi(id: string): string {
  const map: Record<string, string> = {
    shadcn: "shadcn/ui",
    tailwind: "Tailwind 4",
    none: "Nenhum",
  };
  return map[id] ?? titleCase(id);
}

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

export function labelsAuth(id: string): string {
  const map: Record<string, string> = {
    "better-auth": "Better Auth",
    clerk: "Clerk",
    none: "Nenhuma",
  };
  return map[id] ?? titleCase(id);
}

export function labelsApi(id: string): string {
  if (id === "orpc") return "oRPC";
  if (id === "trpc") return "tRPC";
  return titleCase(id);
}

export const ADDON_META = {
  turborepo: {
    label: "Turborepo",
    tagline: "Task graph + cache remoto",
  },
  biome: {
    label: "Biome",
    tagline: "Format + lint",
  },
  husky: {
    label: "Husky + lint-staged",
    tagline: "Pre-commit hooks",
  },
  oxlint: {
    label: "oxlint + oxfmt",
    tagline: "Alternativa ao Biome",
  },
  lefthook: {
    label: "Lefthook",
    tagline: "Hooks Git em YAML",
  },
} as const satisfies Record<string, { label: string; tagline: string }>;

export const EXAMPLE_META = {
  todo: {
    label: "Todo CRUD",
    tagline: "oRPC + Drizzle + frontend",
  },
  "ai-chat": {
    label: "Chat IA (em breve)",
    tagline: "Streaming via Claude",
  },
  "pix-checkout": {
    label: "Checkout PIX",
    tagline: "AbacatePay + webhook",
  },
} as const satisfies Record<string, { label: string; tagline: string }>;
