#!/usr/bin/env node
import { Cli, z } from "incur";
import {
  ApiId as ApiIdSchema,
  AuthId as AuthIdSchema,
  BackendId as BackendIdSchema,
  DbHostingId as DbHostingIdSchema,
  DbId as DbIdSchema,
  DeployId as DeployIdSchema,
  DesktopId as DesktopIdSchema,
  FrontendId as FrontendIdSchema,
  MobileId as MobileIdSchema,
  OrmId as OrmIdSchema,
  PackageManagerId as PackageManagerIdSchema,
  PresetId as PresetIdSchema,
  RuntimeId as RuntimeIdSchema,
  UiId as UiIdSchema,
} from "@veloz-stack/types";
import { runCreate } from "./create.js";

// Re-wrap each enum with incur's own zod instance so schema identity checks
// inside incur recognize them.
const reenum = <T extends { options: readonly string[] }>(s: T) =>
  z.enum(s.options as [string, ...string[]]);

const PresetId = reenum(PresetIdSchema);
const FrontendId = reenum(FrontendIdSchema);
const MobileId = reenum(MobileIdSchema);
const DesktopId = reenum(DesktopIdSchema);
const BackendId = reenum(BackendIdSchema);
const RuntimeId = reenum(RuntimeIdSchema);
const ApiId = reenum(ApiIdSchema);
const DbId = reenum(DbIdSchema);
const OrmId = reenum(OrmIdSchema);
const DbHostingId = reenum(DbHostingIdSchema);
const AuthId = reenum(AuthIdSchema);
const DeployId = reenum(DeployIdSchema);
const PackageManagerId = reenum(PackageManagerIdSchema);
const UiId = reenum(UiIdSchema);

const cli = Cli.create("create-veloz-stack", {
  version: "0.0.1",
  description:
    "Scaffolder TypeScript opinado pro Brasil — PIX, LGPD, SMS, pronto pro Claude. Deploy no Veloz.",
  sync: {
    suggestions: [
      "criar um novo projeto veloz-stack",
      "gerar um starter de checkout PIX",
      "montar um app TanStack Start + Hono + oRPC",
    ],
  },
  args: z.object({
    projectName: z
      .string()
      .optional()
      .describe("Nome da pasta do novo projeto (perguntado se omitido)"),
  }),
  options: z.object({
    preset: PresetId.optional().describe(
      "Modelo pronto: veloz-br | minimal | mern | pern | custom",
    ),
    frontend: FrontendId.optional().describe("Frontend web (single-select)"),
    mobile: MobileId.optional().describe("App mobile (expo | none) — pode coexistir com frontend"),
    desktop: DesktopId.optional().describe("App desktop (tauri | none) — embrulha o frontend web"),
    backend: BackendId.optional().describe("Framework de backend"),
    runtime: RuntimeId.optional().describe("Runtime: bun | node | workers"),
    api: ApiId.optional().describe("Estilo de API: orpc | trpc | rest | none"),
    db: DbId.optional().describe("Banco de dados"),
    orm: OrmId.optional().describe("ORM"),
    dbHosting: DbHostingId.optional().describe("Provedor de hospedagem do banco"),
    auth: AuthId.optional().describe("Autenticação"),
    deploy: DeployId.optional().describe("Alvo de deploy"),
    pm: PackageManagerId.optional().describe("Gerenciador de pacotes"),
    ui: UiId.optional().describe(
      "UI: shadcn (Tailwind 4 + componentes prontos) | tailwind | none",
    ),
    modules: z.string().optional().describe("Módulos, separados por vírgula"),
    examples: z.string().optional().describe("Exemplos prontos, separados por vírgula"),
    addons: z
      .string()
      .optional()
      .describe("Ferramentas extras, separadas por vírgula (turborepo, biome, husky)"),
    yes: z.boolean().optional().describe("Pula as perguntas, usa defaults/flags"),
    install: z.boolean().optional().describe("Instala dependências depois do scaffold"),
    git: z.boolean().optional().describe("Inicializa repositório git depois do scaffold"),
    dryRun: z
      .boolean()
      .optional()
      .describe("Resolve a configuração e mostra, sem escrever arquivos"),
    oxlintStrict: z
      .boolean()
      .optional()
      .describe("Com addon oxlint: gera .oxlintrc.json com perfil mais estrito"),
  }),
  alias: { yes: "y" },
  examples: [
    {
      args: { projectName: "meu-app" },
      options: { yes: true },
      description: "Scaffold com os defaults do preset Veloz BR",
    },
    {
      args: { projectName: "so-api" },
      options: { frontend: "none", backend: "hono", yes: true },
      description: "Projeto só com backend (sem frontend)",
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
