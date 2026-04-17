#!/usr/bin/env node
import { Cli, z } from "incur";
import {
  ApiId as ApiIdSchema,
  AuthId as AuthIdSchema,
  BackendId as BackendIdSchema,
  DbHostingId as DbHostingIdSchema,
  DbId as DbIdSchema,
  DeployId as DeployIdSchema,
  FrontendId as FrontendIdSchema,
  OrmId as OrmIdSchema,
  PackageManagerId as PackageManagerIdSchema,
  PresetId as PresetIdSchema,
  RuntimeId as RuntimeIdSchema,
} from "@veloz-stack/types";
import { runCreate } from "./create.js";

// Re-wrap each enum with incur's own zod instance so schema identity checks
// inside incur recognize them.
const reenum = <T extends { options: readonly string[] }>(s: T) =>
  z.enum(s.options as [string, ...string[]]);

const PresetId = reenum(PresetIdSchema);
const FrontendId = reenum(FrontendIdSchema);
const BackendId = reenum(BackendIdSchema);
const RuntimeId = reenum(RuntimeIdSchema);
const ApiId = reenum(ApiIdSchema);
const DbId = reenum(DbIdSchema);
const OrmId = reenum(OrmIdSchema);
const DbHostingId = reenum(DbHostingIdSchema);
const AuthId = reenum(AuthIdSchema);
const DeployId = reenum(DeployIdSchema);
const PackageManagerId = reenum(PackageManagerIdSchema);

const cli = Cli.create("create-veloz-stack", {
  version: "0.0.1",
  description:
    "Opinionated TypeScript scaffolder for Brazil — PIX, LGPD, SMS, Claude-ready. Deploys to Veloz.",
  sync: {
    suggestions: [
      "create a new veloz-stack project",
      "scaffold a pix checkout starter",
      "build a TanStack Start + Hono + oRPC app",
    ],
  },
  args: z.object({
    projectName: z
      .string()
      .optional()
      .describe("Directory name for the new project (prompted if omitted)"),
  }),
  options: z.object({
    preset: PresetId.optional().describe("Preset: veloz-br | minimal | mern | pern | custom"),
    frontend: FrontendId.optional().describe("Frontend framework"),
    backend: BackendId.optional().describe("Backend framework"),
    runtime: RuntimeId.optional().describe("Runtime: bun | node | workers"),
    api: ApiId.optional().describe("API style: orpc | trpc | rest | none"),
    db: DbId.optional().describe("Database engine"),
    orm: OrmId.optional().describe("ORM"),
    dbHosting: DbHostingId.optional().describe("Managed DB provider"),
    auth: AuthId.optional().describe("Auth provider"),
    deploy: DeployId.optional().describe("Deploy target"),
    pm: PackageManagerId.optional().describe("Package manager"),
    modules: z.string().optional().describe("Comma-separated feature modules"),
    examples: z.string().optional().describe("Comma-separated example apps"),
    addons: z.string().optional().describe("Comma-separated addons (turborepo, biome, husky)"),
    yes: z.boolean().optional().describe("Skip prompts, use defaults/flags"),
    install: z.boolean().optional().describe("Install dependencies after scaffold"),
    git: z.boolean().optional().describe("Initialize git repo after scaffold"),
    dryRun: z.boolean().optional().describe("Resolve config and print, but do not write files"),
  }),
  alias: { yes: "y" },
  examples: [
    {
      args: { projectName: "my-app" },
      options: { yes: true },
      description: "Scaffold with the Veloz BR defaults",
    },
    {
      args: { projectName: "api-only" },
      options: { frontend: "none", backend: "hono", yes: true },
      description: "Server-only project",
    },
  ],
  async run(c) {
    await runCreate({
      projectName: c.args.projectName,
      ...(c.options as Record<string, unknown>),
    } as Parameters<typeof runCreate>[0]);
  },
});

cli.serve();
