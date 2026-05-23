import {
  cancel,
  confirm,
  intro,
  isCancel,
  multiselect,
  select,
  text,
} from "@clack/prompts";
import {
  ApiId,
  AuthId,
  applyImplicitStackRules,
  BackendId,
  COMING_SOON_PRESETS,
  DbHostingId,
  DbId,
  DeployId,
  FrontendId,
  getApiDisableReason,
  getAuthDisableReason,
  getBackendDisableReason,
  getDbHostingDisableReason,
  getDeployDisableReason,
  getModuleDisableReason,
  getOrmDisableReason,
  getRuntimeDisableReason,
  getUiDisableReason,
  MODULE_CATEGORIES,
  MODULE_CATEGORY_LABELS,
  MODULES,
  OrmId,
  PackageManagerId,
  PRESETS,
  PresetId,
  RuntimeId,
  UiId,
} from "@veloz-stack/types";
import type {
  ModuleId,
  PresetId as PresetIdType,
  ProjectConfig,
} from "./stack-types.js";
import chalk from "chalk";

type CreateInput = Partial<ProjectConfig> & { projectName?: string };

const COMING_SOON = new Set<string>(COMING_SOON_PRESETS);

interface PickOneParams<T extends string> {
  message: string;
  options: readonly T[];
  initial: T;
  disabled: (id: T) => string | null;
  labels?: (id: T) => string;
}

/** Interactive Clack prompts; applies the same implicit stack rules as the web builder. */
export async function gatherInteractive(
  seeded: ProjectConfig,
  input: CreateInput,
): Promise<ProjectConfig> {
  intro(chalk.hex("#FF4D00").bold("◆ veloz/stack"));

  const cfg: ProjectConfig = { ...seeded };

  await promptProjectName(cfg, input);
  await promptPreset(cfg, input);
  await promptPlatformStack(cfg, input);
  await promptDataStack(cfg, input);
  await promptProductStack(cfg, input);
  await promptModules(cfg, input);
  await promptToggles(cfg, input);

  return cfg;
}

async function promptProjectName(
  cfg: ProjectConfig,
  input: CreateInput,
): Promise<void> {
  if (input.projectName) {
    return;
  }
  const name = await text({
    message: "Qual o nome do projeto?",
    placeholder: cfg.projectName,
    defaultValue: cfg.projectName,
    validate: (v): string | undefined => {
      if (v && !/^[a-z0-9][a-z0-9-_]*$/.test(v)) {
        return "Use letras minúsculas, dígitos, hífens e underscores.";
      }
      return undefined;
    },
  });
  cancelIfNeeded(name);
  cfg.projectName = expectString(name, "project name");
}

async function promptPreset(
  cfg: ProjectConfig,
  input: CreateInput,
): Promise<void> {
  if (input.preset !== undefined) {
    return;
  }
  const preset = await select({
    message: "Qual modelo pronto?",
    initialValue: cfg.preset,
    options: availablePresetOptions(),
  });
  cancelIfNeeded(preset);
  const presetId = expectPresetId(preset);
  if (presetId !== "custom") {
    Object.assign(cfg, PRESETS[presetId].config);
  }
  cfg.preset = presetId;
}

function availablePresetOptions() {
  return PresetId.options
    .filter(isAvailablePreset)
    .filter((preset) => isPresetKey(preset))
    .map((k) => ({
      value: k,
      label: PRESETS[k].label,
      hint: PRESETS[k].description,
    }));
}

function isAvailablePreset(preset: PresetIdType): boolean {
  return !COMING_SOON.has(preset);
}

function isPresetKey(preset: PresetIdType): preset is keyof typeof PRESETS {
  return Object.hasOwn(PRESETS, preset);
}

async function promptPlatformStack(
  cfg: ProjectConfig,
  input: CreateInput,
): Promise<void> {
  cfg.frontend = await pickOne({
    message: "Frontend",
    options: FrontendId.options,
    initial: coalesce(input.frontend, cfg.frontend),
    disabled: () => null,
    labels: frontendLabels,
  });
  applyBackendCascade(cfg, input);
  cfg.backend = await pickOne({
    message: "Backend",
    options: BackendId.options,
    initial: coalesce(input.backend, cfg.backend),
    disabled: (id) => getBackendDisableReason({ ...cfg, backend: id }, id),
  });
  cfg.runtime = await pickOne({
    message: "Runtime",
    options: RuntimeId.options,
    initial: coalesce(input.runtime, cfg.runtime),
    disabled: (id) => getRuntimeDisableReason({ ...cfg, runtime: id }, id),
  });
}

function applyBackendCascade(cfg: ProjectConfig, input: CreateInput): void {
  if (input.backend !== undefined) {
    return;
  }
  const cascaded = applyImplicitStackRules(cfg, {
    backend: false,
    runtime: input.runtime !== undefined,
  });
  cfg.backend = cascaded.backend;
  cfg.runtime = cascaded.runtime;
}

async function promptDataStack(
  cfg: ProjectConfig,
  input: CreateInput,
): Promise<void> {
  cfg.api = await pickOne({
    message: "API",
    options: ApiId.options,
    initial: coalesce(input.api, cfg.api),
    disabled: (id) => getApiDisableReason({ ...cfg, api: id }, id),
    labels: apiLabels,
  });
  cfg.db = await pickOne({
    message: "Banco de dados",
    options: DbId.options,
    initial: coalesce(input.db, cfg.db),
    disabled: () => null,
  });
  cfg.orm = await pickOne({
    message: "ORM",
    options: OrmId.options,
    initial: coalesce(input.orm, cfg.orm),
    disabled: (id) => getOrmDisableReason({ ...cfg, orm: id }, id),
  });
  cfg.dbHosting = await pickOne({
    message: "Hospedagem do banco",
    options: DbHostingId.options,
    initial: coalesce(input.dbHosting, cfg.dbHosting),
    disabled: (id) => getDbHostingDisableReason({ ...cfg, dbHosting: id }, id),
  });
}

async function promptProductStack(
  cfg: ProjectConfig,
  input: CreateInput,
): Promise<void> {
  cfg.auth = await pickOne({
    message: "Autenticação",
    options: AuthId.options,
    initial: coalesce(input.auth, cfg.auth),
    disabled: (id) => getAuthDisableReason({ ...cfg, auth: id }, id),
    labels: authLabels,
  });
  cfg.deploy = await pickOne({
    message: "Alvo de deploy",
    options: DeployId.options,
    initial: coalesce(input.deploy, cfg.deploy),
    disabled: (id) => getDeployDisableReason({ ...cfg, deploy: id }, id),
  });
  cfg.pm = await pickOne({
    message: "Gerenciador de pacotes",
    options: PackageManagerId.options,
    initial: coalesce(input.pm, cfg.pm),
    disabled: () => null,
  });
  cfg.ui = await pickOne({
    message: "UI",
    options: UiId.options,
    initial: coalesce(input.ui, cfg.ui),
    disabled: (id) => getUiDisableReason({ ...cfg, ui: id }, id),
    labels: uiLabels,
  });
}

async function promptModules(
  cfg: ProjectConfig,
  input: CreateInput,
): Promise<void> {
  if (input.modules !== undefined) {
    return;
  }
  const picked = await multiselect({
    message: "Módulos (espaço pra alternar, enter pra confirmar)",
    initialValues: cfg.modules,
    required: false,
    options: buildModuleOptions(cfg),
  });
  cancelIfNeeded(picked);
  cfg.modules = expectStringArray(picked).filter((id) =>
    isEnabledModuleId(cfg)(id),
  );
}

function buildModuleOptions(cfg: ProjectConfig) {
  const options: { value: string; label: string; hint?: string }[] = [];
  for (const cat of MODULE_CATEGORIES) {
    const mods = Object.values(MODULES).filter((m) => m.category === cat);
    for (const m of mods) {
      const reason = getModuleDisableReason(cfg, m.id);
      options.push({
        value: m.id,
        label: moduleOptionLabel(cat, m.name, m.brazilian === true),
        hint: reason ?? m.tagline,
      });
    }
  }
  return options;
}

function moduleOptionLabel(
  category: keyof typeof MODULE_CATEGORY_LABELS,
  name: string,
  brazilian: boolean,
): string {
  const brSuffix = brazilian ? " · BR" : "";
  return `${MODULE_CATEGORY_LABELS[category]} / ${name}${brSuffix}`;
}

async function promptToggles(
  cfg: ProjectConfig,
  input: CreateInput,
): Promise<void> {
  if (input.install === undefined) {
    const install = await confirm({
      message: "Instalar dependências?",
      initialValue: cfg.install,
    });
    cancelIfNeeded(install);
    cfg.install = expectBoolean(install);
  }
  if (input.git === undefined) {
    const git = await confirm({
      message: "Inicializar repositório git?",
      initialValue: cfg.git,
    });
    cancelIfNeeded(git);
    cfg.git = expectBoolean(git);
  }
}

function coalesce<T>(value: T | undefined, fallback: T): T {
  return value ?? fallback;
}

function isEnabledModuleId(cfg: ProjectConfig): (id: string) => id is ModuleId {
  return (id): id is ModuleId => {
    if (!isModuleId(id)) {
      return false;
    }
    return !getModuleDisableReason(cfg, id);
  };
}

function isModuleId(id: string): id is ModuleId {
  return id in MODULES;
}

async function pickOne<T extends string>(params: PickOneParams<T>): Promise<T> {
  const opts = params.options.map((id) => {
    const reason = params.disabled(id);
    const labelFn = params.labels ?? titleCase;
    const option: { value: T; label: string; hint?: string } = {
      value: id,
      label: labelFn(id),
    };
    if (reason) {
      option.hint = reason;
    }
    return option;
  });
  const picked = await select({
    message: params.message,
    initialValue: params.initial,
    options: opts as { value: string; label: string; hint?: string }[],
  });
  cancelIfNeeded(picked);
  return expectOptionValue(picked, params.options);
}

function cancelIfNeeded(v: unknown): void {
  if (isCancel(v)) {
    cancel("Abortado.");
    process.exit(0);
  }
}

function expectString(v: unknown, label: string): string {
  if (typeof v !== "string") {
    throw new TypeError(`Expected string for ${label}`);
  }
  return v;
}

function expectBoolean(v: unknown): boolean {
  if (typeof v !== "boolean") {
    throw new TypeError("Expected boolean");
  }
  return v;
}

function expectPresetId(v: unknown): ProjectConfig["preset"] {
  const parsed = PresetId.safeParse(v);
  if (!parsed.success) {
    throw new TypeError(`Invalid preset: ${String(v)}`);
  }
  return parsed.data;
}

function expectStringArray(v: unknown): string[] {
  if (!Array.isArray(v) || !v.every((item) => typeof item === "string")) {
    throw new TypeError("Expected string array");
  }
  return v;
}

function expectOptionValue<T extends string>(
  v: unknown,
  options: readonly T[],
): T {
  if (typeof v !== "string") {
    throw new TypeError(`Invalid selection: ${String(v)}`);
  }
  for (const option of options) {
    if (option === v) {
      return option;
    }
  }
  throw new TypeError(`Invalid selection: ${v}`);
}

function titleCase(s: string): string {
  if (s === "none") {
    return "Nenhum";
  }
  return s
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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
  if (id === "orpc") {
    return "oRPC";
  }
  if (id === "trpc") {
    return "tRPC";
  }
  return titleCase(id);
}

function authLabels(id: string): string {
  if (id === "better-auth") {
    return "Better Auth";
  }
  if (id === "clerk") {
    return "Clerk";
  }
  if (id === "none") {
    return "Nenhuma";
  }
  return titleCase(id);
}

function uiLabels(id: string): string {
  if (id === "shadcn") {
    return "shadcn/ui (Tailwind 4)";
  }
  if (id === "tailwind") {
    return "Tailwind 4 (sem componentes)";
  }
  if (id === "none") {
    return "Nenhum (CSS puro)";
  }
  return titleCase(id);
}
