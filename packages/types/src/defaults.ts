import type { ProjectConfig } from "./index";
import { MODULES, type ModuleId } from "./modules";

export const DEFAULT_CONFIG: ProjectConfig = {
  projectName: "my-veloz-stack",
  frontend: "tanstack-start",
  mobile: "none",
  desktop: "none",
  backend: "hono",
  runtime: "bun",
  api: "orpc",
  db: "postgres",
  orm: "drizzle",
  dbHosting: "veloz",
  auth: "better-auth",
  deploy: "veloz",
  pm: "bun",
  ui: "shadcn",
  examples: [],
  modules: (Object.values(MODULES)
    .filter((m) => m.defaultOn)
    .map((m) => m.id) as ModuleId[]),
  addons: ["turborepo", "biome"],
  oxlintStrict: false,
  lefthookCi: false,
  lefthookAdvanced: false,
  git: true,
  install: true,
  preset: "veloz-br",
};

export const PRESETS = {
  "veloz-br": {
    label: "Veloz BR",
    description: "Stack opinado pro Brasil — PIX, SMS, LGPD, pronto pro Claude",
    config: DEFAULT_CONFIG,
  },
  minimal: {
    label: "Mínimo",
    description: "Só a camada técnica — nenhum módulo de funcionalidade",
    config: {
      ...DEFAULT_CONFIG,
      preset: "minimal" as const,
      modules: [] as ModuleId[],
      examples: [] as ProjectConfig["examples"],
    },
  },
  mern: {
    label: "MERN",
    description: "Mongo · Express · React (TanStack) · Node",
    config: {
      ...DEFAULT_CONFIG,
      preset: "mern" as const,
      frontend: "tanstack-start" as const,
      backend: "express" as const,
      runtime: "node" as const,
      api: "rest" as const,
      db: "mongodb" as const,
      orm: "mongoose" as const,
      dbHosting: "mongodb-atlas" as const,
      modules: [] as ModuleId[],
    },
  },
  pern: {
    label: "PERN",
    description: "Postgres · Express · React · Node",
    config: {
      ...DEFAULT_CONFIG,
      preset: "pern" as const,
      backend: "express" as const,
      runtime: "node" as const,
      api: "rest" as const,
      modules: [] as ModuleId[],
    },
  },
  "next-native": {
    label: "Next.js nativo",
    description: "App Router · Route Handlers · oRPC same-origin · deploy Veloz",
    config: {
      ...DEFAULT_CONFIG,
      preset: "next-native" as const,
      frontend: "next" as const,
      backend: "next" as const,
      runtime: "node" as const,
      api: "orpc" as const,
      deploy: "veloz" as const,
      pm: "pnpm" as const,
      modules: [] as ModuleId[],
    },
  },
} satisfies Record<string, { label: string; description: string; config: ProjectConfig }>;

export type PresetKey = keyof typeof PRESETS;
