import * as p from "@clack/prompts";
import chalk from "chalk";
import {
  ApiId,
  AuthId,
  BackendId,
  DbHostingId,
  DbId,
  DeployId,
  FrontendId,
  MODULES,
  MODULE_CATEGORIES,
  MODULE_CATEGORY_LABELS,
  OrmId,
  PRESETS,
  PackageManagerId,
  RuntimeId,
  type ProjectConfig,
  getApiDisableReason,
  getBackendDisableReason,
  getDbHostingDisableReason,
  getDeployDisableReason,
  getModuleDisableReason,
  getOrmDisableReason,
  getRuntimeDisableReason,
} from "@veloz-stack/types";

type CreateInput = Partial<ProjectConfig> & { projectName?: string };

export async function gatherInteractive(
  seeded: ProjectConfig,
  input: CreateInput,
): Promise<ProjectConfig> {
  p.intro(chalk.hex("#FF4D00").bold("◆ veloz/stack"));

  const cfg: ProjectConfig = { ...seeded };

  // Project name
  if (!input.projectName) {
    const name = await p.text({
      message: "Qual o nome do projeto?",
      placeholder: seeded.projectName,
      defaultValue: seeded.projectName,
      validate: (v) => {
        if (!v) return;
        if (!/^[a-z0-9][a-z0-9-_]*$/.test(v))
          return "Use letras minúsculas, dígitos, hífens e underscores.";
      },
    });
    cancelIfNeeded(name);
    cfg.projectName = name as string;
  }

  // Preset
  if (input.preset === undefined) {
    const preset = await p.select({
      message: "Qual modelo pronto?",
      initialValue: seeded.preset,
      options: (Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((k) => ({
        value: k,
        label: PRESETS[k].label,
        hint: PRESETS[k].description,
      })),
    });
    cancelIfNeeded(preset);
    if (preset !== "custom") {
      Object.assign(cfg, PRESETS[preset as keyof typeof PRESETS].config);
      cfg.projectName = cfg.projectName; // keep user-provided name
    }
    cfg.preset = preset as typeof cfg.preset;
  }

  // Stack choices (only prompt if not already supplied by flags)
  cfg.frontend = await pickOne(
    "Frontend",
    FrontendId.options,
    input.frontend ?? cfg.frontend,
    () => null,
    frontendLabels,
  );
  cfg.backend = await pickOne(
    "Backend",
    BackendId.options,
    input.backend ?? cfg.backend,
    (id) => getBackendDisableReason({ ...cfg, backend: id }, id),
  );
  cfg.runtime = await pickOne(
    "Runtime",
    RuntimeId.options,
    input.runtime ?? cfg.runtime,
    (id) => getRuntimeDisableReason({ ...cfg, runtime: id }, id),
  );
  cfg.api = await pickOne(
    "API",
    ApiId.options,
    input.api ?? cfg.api,
    (id) => getApiDisableReason({ ...cfg, api: id }, id),
    apiLabels,
  );
  cfg.db = await pickOne("Banco de dados", DbId.options, input.db ?? cfg.db, () => null);
  cfg.orm = await pickOne(
    "ORM",
    OrmId.options,
    input.orm ?? cfg.orm,
    (id) => getOrmDisableReason({ ...cfg, orm: id }, id),
  );
  cfg.dbHosting = await pickOne(
    "Hospedagem do banco",
    DbHostingId.options,
    input.dbHosting ?? cfg.dbHosting,
    (id) => getDbHostingDisableReason({ ...cfg, dbHosting: id }, id),
  );
  cfg.auth = await pickOne(
    "Autenticação",
    AuthId.options,
    input.auth ?? cfg.auth,
    () => null,
    authLabels,
  );
  cfg.deploy = await pickOne(
    "Alvo de deploy",
    DeployId.options,
    input.deploy ?? cfg.deploy,
    (id) => getDeployDisableReason({ ...cfg, deploy: id }, id),
  );
  cfg.pm = await pickOne(
    "Gerenciador de pacotes",
    PackageManagerId.options,
    input.pm ?? cfg.pm,
    () => null,
  );

  // Modules — grouped multi-select
  if (input.modules === undefined) {
    const options: Array<{ value: string; label: string; hint?: string }> = [];
    for (const cat of MODULE_CATEGORIES) {
      const mods = Object.values(MODULES).filter((m) => m.category === cat);
      if (mods.length === 0) continue;
      for (const m of mods) {
        const reason = getModuleDisableReason(cfg, m.id);
        options.push({
          value: m.id,
          label: `${MODULE_CATEGORY_LABELS[cat]} / ${m.name}${m.brazilian ? " · BR" : ""}`,
          hint: reason ?? m.tagline,
        });
      }
    }
    const picked = await p.multiselect({
      message: "Módulos (espaço pra alternar, enter pra confirmar)",
      initialValues: cfg.modules as string[],
      required: false,
      options,
    });
    cancelIfNeeded(picked);
    cfg.modules = (picked as string[]).filter((id) => {
      const m = MODULES[id as keyof typeof MODULES];
      return m && !getModuleDisableReason(cfg, m.id);
    }) as typeof cfg.modules;
  }

  // Toggles
  if (input.install === undefined) {
    const install = await p.confirm({
      message: "Instalar dependências?",
      initialValue: cfg.install,
    });
    cancelIfNeeded(install);
    cfg.install = install as boolean;
  }
  if (input.git === undefined) {
    const git = await p.confirm({
      message: "Inicializar repositório git?",
      initialValue: cfg.git,
    });
    cancelIfNeeded(git);
    cfg.git = git as boolean;
  }

  return cfg;
}

async function pickOne<T extends string>(
  message: string,
  options: readonly T[],
  initial: T,
  disabled: (id: T) => string | null,
  labels?: (id: T) => string,
): Promise<T> {
  const opts = options.map((id) => {
    const reason = disabled(id);
    return {
      value: id as string,
      label: (labels ? labels(id) : titleCase(id)) + (reason ? chalk.dim(` (${reason})`) : ""),
    };
  });
  const picked = await p.select({
    message,
    initialValue: initial as string,
    options: opts,
  });
  cancelIfNeeded(picked);
  // If the user picked a disabled option, the inline label warned them —
  // but we still accept the choice; `validateConfig` will fail-fast later.
  return picked as T;
}

function cancelIfNeeded(v: unknown): void {
  if (p.isCancel(v)) {
    p.cancel("Abortado.");
    process.exit(0);
  }
}

function titleCase(s: string): string {
  if (s === "none") return "Nenhum";
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function frontendLabels(id: string): string {
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

function apiLabels(id: string): string {
  if (id === "orpc") return "oRPC";
  if (id === "trpc") return "tRPC";
  return titleCase(id);
}

function authLabels(id: string): string {
  if (id === "better-auth") return "Better Auth";
  if (id === "clerk") return "Clerk";
  if (id === "none") return "Nenhuma";
  return titleCase(id);
}
