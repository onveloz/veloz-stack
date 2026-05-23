/**
 * Canonical stack configuration schemas shared by the CLI, web builder, and template generator.
 * @packageDocumentation
 */
import { z } from "zod";
import { MODULE_IDS } from "./modules";

/** Web framework axis (TanStack Start, Next.js, meta-frameworks, or none). */
export const FrontendId = z.enum([
  "tanstack-start",
  "next",
  "nuxt",
  "svelte-kit",
  "astro",
  "none",
]);
/** Inferred type for {@link FrontendId}. */
export type FrontendId = z.infer<typeof FrontendId>;

/** Mobile app axis (Expo or none; can coexist with a web frontend). */
export const MobileId = z.enum(["expo", "none"]);
/** Inferred type for {@link MobileId}. */
export type MobileId = z.infer<typeof MobileId>;

/** Desktop shell axis (Tauri wrapping the web frontend, or none). */
export const DesktopId = z.enum(["tauri", "none"]);
/** Inferred type for {@link DesktopId}. */
export type DesktopId = z.infer<typeof DesktopId>;

/** Server/API layer axis (Hono split server, Next Route Handlers, or unimplemented frameworks). */
export const BackendId = z.enum([
  "hono",
  "next",
  "express",
  "fastify",
  "elysia",
  "none",
]);
/** Inferred type for {@link BackendId}. */
export type BackendId = z.infer<typeof BackendId>;

/** JavaScript runtime for the backend (Bun, Node, or Cloudflare Workers). */
export const RuntimeId = z.enum(["bun", "node", "workers"]);
/** Inferred type for {@link RuntimeId}. */
export type RuntimeId = z.infer<typeof RuntimeId>;

/** API style axis (oRPC today; tRPC/REST reserved). */
export const ApiId = z.enum(["orpc", "trpc", "rest", "none"]);
/** Inferred type for {@link ApiId}. */
export type ApiId = z.infer<typeof ApiId>;

/** Database engine axis. */
export const DbId = z.enum(["postgres", "mysql", "sqlite", "mongodb", "none"]);
/** Inferred type for {@link DbId}. */
export type DbId = z.infer<typeof DbId>;

/** ORM axis (Drizzle, Prisma, Mongoose, or none). */
export const OrmId = z.enum(["drizzle", "prisma", "mongoose", "none"]);
/** Inferred type for {@link OrmId}. */
export type OrmId = z.infer<typeof OrmId>;

/** Managed database hosting provider axis. */
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
/** Inferred type for {@link DbHostingId}. */
export type DbHostingId = z.infer<typeof DbHostingId>;

/** Authentication provider axis. */
export const AuthId = z.enum(["better-auth", "clerk", "none"]);
/** Inferred type for {@link AuthId}. */
export type AuthId = z.infer<typeof AuthId>;

/** Deployment target axis. */
export const DeployId = z.enum([
  "veloz",
  "vercel",
  "cloudflare",
  "fly",
  "render",
  "docker",
  "none",
]);
/** Inferred type for {@link DeployId}. */
export type DeployId = z.infer<typeof DeployId>;

/** Package manager for the generated monorepo. */
export const PackageManagerId = z.enum(["bun", "pnpm", "npm"]);
/** Inferred type for {@link PackageManagerId}. */
export type PackageManagerId = z.infer<typeof PackageManagerId>;

/** Optional demo apps bundled into the scaffold. */
export const ExampleId = z.enum(["todo", "ai-chat", "pix-checkout", "none"]);
/** Inferred type for {@link ExampleId}. */
export type ExampleId = z.infer<typeof ExampleId>;

/** Named starter presets (Veloz BR, minimal, roadmap MERN/PERN, Next-native). */
export const PresetId = z.enum([
  "veloz-br",
  "minimal",
  "mern",
  "pern",
  "next-native",
  "custom",
]);
/** Inferred type for {@link PresetId}. */
export type PresetId = z.infer<typeof PresetId>;

/** Monorepo tooling and lint/hook addons for generated projects. */
export const AddonId = z.enum([
  "turborepo",
  "biome",
  "husky",
  "oxlint",
  "lefthook",
]);
/** Inferred type for {@link AddonId}. */
export type AddonId = z.infer<typeof AddonId>;

/** CSS/component UI stack for web frontends. */
export const UiId = z.enum(["tailwind", "shadcn", "none"]);
/** Inferred type for {@link UiId}. */
export type UiId = z.infer<typeof UiId>;

/** Optional integration module ids (payments, SMS, observability, etc.). */
export const ModuleId = z.enum(MODULE_IDS);
/** Inferred type for {@link ModuleId}. */
export type ModuleId = z.infer<typeof ModuleId>;

/** Full stack selection for scaffolding (CLI flags, web builder state, generator input). */
export const ProjectConfig = z.object({
  projectName: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, {
      message: "lowercase letters, digits, hyphen, underscore",
    }),
  frontend: FrontendId,
  mobile: MobileId.default("none"),
  desktop: DesktopId.default("none"),
  backend: BackendId,
  runtime: RuntimeId,
  api: ApiId,
  db: DbId,
  orm: OrmId,
  dbHosting: DbHostingId,
  auth: AuthId,
  deploy: DeployId,
  pm: PackageManagerId,
  ui: UiId.default("shadcn"),
  examples: z.array(ExampleId).default([]),
  modules: z.array(ModuleId).default([]),
  addons: z.array(AddonId).default([]),
  /** When `oxlint` addon is on, enables stricter oxlint rules in generated `.oxlintrc.json`. */
  oxlintStrict: z.boolean().default(false),
  /** Pre-push + GitHub Actions CI básico (requires `lefthook` addon). */
  lefthookCi: z.boolean().default(false),
  /** Hooks rigorosos + commitlint + CI avançado (requires `lefthook`; incompatível com `lefthookCi`). */
  lefthookAdvanced: z.boolean().default(false),
  git: z.boolean().default(true),
  install: z.boolean().default(true),
  preset: PresetId.default("custom"),
});
/** Inferred type for {@link ProjectConfig}. */
export type ProjectConfig = z.infer<typeof ProjectConfig>;

/** Persisted stack manifest written to `veloz-stack.jsonc` in every scaffolded project. */
export const VelozStackConfigFile = ProjectConfig.omit({
  projectName: true,
  git: true,
  install: true,
}).extend({
  $schema: z.string().optional(),
  version: z.string(),
  createdAt: z.iso.datetime(),
  reproducibleCommand: z.string().optional(),
});
/** Inferred type for {@link VelozStackConfigFile}. */
export type VelozStackConfigFile = z.infer<typeof VelozStackConfigFile>;

export {
  applyImplicitStackRules,
  FRONTEND_NEXT_BACKEND_CASCADE_REASON,
  getAddonDisableReason,
  getApiDisableReason,
  getAuthDisableReason,
  getBackendDisableReason,
  getDbHostingDisableReason,
  getDeployDisableReason,
  getFrontendDisableReason,
  getModuleDisableReason,
  getOrmDisableReason,
  getRuntimeDisableReason,
  getUiDisableReason,
  isBrazilModule,
  LEAVE_NEXT_BACKEND_CASCADE_REASON,
  LEAVE_NEXT_RUNTIME_CASCADE_REASON,
  validateConfig,
} from "./compatibility";
/** @internal Generated-app type. */
export type { DisableReason, ExplicitStackFields } from "./compatibility";
export { COMING_SOON_PRESETS, DEFAULT_CONFIG, PRESETS } from "./defaults";
/** @internal Generated-app type. */
export type { PresetKey } from "./defaults";
export {
  ADDON_META,
  EXAMPLE_META,
  getOptionHint,
  labelsApi,
  labelsAuth,
  labelsBackend,
  labelsDbHost,
  labelsDeploy,
  labelsFrontend,
  labelsUi,
  OPTION_HINTS,
  titleCase,
} from "./labels";
export {
  MODULE_CATEGORIES,
  MODULE_CATEGORY_LABELS,
  MODULE_IDS,
  MODULES,
} from "./modules";
/** @internal Generated-app type. */
export type { ModuleCategory, ModuleMeta } from "./modules";
export {
  VELOZ_STACK_CONFIG_FILENAME,
  VELOZ_STACK_CONFIG_SCHEMA_URL,
} from "./veloz-stack-config";
