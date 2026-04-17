import { z } from "zod";
import { MODULE_IDS } from "./modules";

export const FrontendId = z.enum([
  "tanstack-start",
  "next",
  "nuxt",
  "svelte-kit",
  "astro",
  "native-expo",
  "none",
]);
export type FrontendId = z.infer<typeof FrontendId>;

export const BackendId = z.enum(["hono", "express", "fastify", "elysia", "none"]);
export type BackendId = z.infer<typeof BackendId>;

export const RuntimeId = z.enum(["bun", "node", "workers"]);
export type RuntimeId = z.infer<typeof RuntimeId>;

export const ApiId = z.enum(["orpc", "trpc", "rest", "none"]);
export type ApiId = z.infer<typeof ApiId>;

export const DbId = z.enum(["postgres", "mysql", "sqlite", "mongodb", "none"]);
export type DbId = z.infer<typeof DbId>;

export const OrmId = z.enum(["drizzle", "prisma", "mongoose", "none"]);
export type OrmId = z.infer<typeof OrmId>;

export const DbHostingId = z.enum([
  "veloz",
  "neon",
  "supabase",
  "planetscale",
  "turso",
  "mongodb-atlas",
  "docker",
  "none",
]);
export type DbHostingId = z.infer<typeof DbHostingId>;

export const AuthId = z.enum(["better-auth", "clerk", "none"]);
export type AuthId = z.infer<typeof AuthId>;

export const DeployId = z.enum([
  "veloz",
  "vercel",
  "cloudflare",
  "fly",
  "render",
  "docker",
  "none",
]);
export type DeployId = z.infer<typeof DeployId>;

export const PackageManagerId = z.enum(["bun", "pnpm", "npm"]);
export type PackageManagerId = z.infer<typeof PackageManagerId>;

export const ExampleId = z.enum(["todo", "ai-chat", "pix-checkout", "none"]);
export type ExampleId = z.infer<typeof ExampleId>;

export const PresetId = z.enum([
  "veloz-br",
  "minimal",
  "mern",
  "pern",
  "custom",
]);
export type PresetId = z.infer<typeof PresetId>;

export const AddonId = z.enum(["turborepo", "biome", "husky"]);
export type AddonId = z.infer<typeof AddonId>;

export const ModuleId = z.enum(MODULE_IDS);
export type ModuleId = z.infer<typeof ModuleId>;

export const ProjectConfig = z.object({
  projectName: z.string().min(1).regex(/^[a-z0-9][a-z0-9-_]*$/, {
    message: "lowercase letters, digits, hyphen, underscore",
  }),
  frontend: FrontendId,
  backend: BackendId,
  runtime: RuntimeId,
  api: ApiId,
  db: DbId,
  orm: OrmId,
  dbHosting: DbHostingId,
  auth: AuthId,
  deploy: DeployId,
  pm: PackageManagerId,
  examples: z.array(ExampleId).default([]),
  modules: z.array(ModuleId).default([]),
  addons: z.array(AddonId).default([]),
  git: z.boolean().default(true),
  install: z.boolean().default(true),
  preset: PresetId.default("custom"),
});
export type ProjectConfig = z.infer<typeof ProjectConfig>;

export * from "./modules";
export * from "./defaults";
export * from "./compatibility";
