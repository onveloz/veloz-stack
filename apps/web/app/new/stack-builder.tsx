"use client";

import {
  ApiId,
  AuthId,
  BackendId,
  COMING_SOON_PRESETS,
  DbHostingId,
  DbId,
  DeployId,
  DesktopId,
  ExampleId,
  FrontendId,
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
  MODULE_CATEGORIES,
  MODULE_CATEGORY_LABELS,
  MODULES,
  MobileId,
  type ModuleId,
  type ModuleMeta,
  OrmId,
  PackageManagerId,
  PRESETS,
  type ProjectConfig,
  RuntimeId,
  UiId,
  validateConfig,
} from "@veloz-stack/types";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  Share2,
  Shuffle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ConfirmCascadeDialog } from "@/components/confirm-dialog";
import { CopyButton } from "@/components/copy-button";
import { Logo } from "@/components/logo";
import { StackAddonPickers } from "@/components/stack-addon-pickers";
import { buildCommand } from "@/lib/build-command";
import { getHint } from "@/lib/option-hints";
import { buildSurpriseConfig } from "@/lib/randomize-stack";
import {
  type ConfigChange,
  repairStackConfig,
  resolveConfig,
  resolveEnableModule,
} from "@/lib/resolve-config";
import {
  addonFlagsAfterGitHook,
  addonFlagsAfterLinter,
  type GitHookChoice,
  type LinterChoice,
  patchAddonsForGitHook,
  patchAddonsForLinter,
  patchAddonsTurborepo,
} from "@/lib/stack-addons";
import { useStackConfig } from "@/lib/use-stack-config";
import { PreviewPanel } from "./preview-panel";
import {
  EXAMPLE_META,
  labelsApi,
  labelsAuth,
  labelsBackend,
  labelsDbHost,
  labelsDeploy,
  labelsFrontend,
  labelsUi,
  titleCase,
} from "./stack-builder-labels";

type StepId = "platform" | "data" | "brazil" | "tools" | "review";
type BuilderMode = "quick" | "full";

const STEPS: { id: StepId; label: string; short: string }[] = [
  { id: "platform", label: "Plataforma", short: "App & API" },
  { id: "data", label: "Dados & deploy", short: "DB · auth" },
  { id: "brazil", label: "Integrações", short: "Módulos" },
  { id: "tools", label: "Ferramentas", short: "DX · exemplos" },
  { id: "review", label: "Revisar", short: "Comando" },
];

const QUICK_STEPS: StepId[] = ["platform", "brazil", "tools", "review"];

const MODULE_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "payments", label: "PIX" },
  { id: "messaging", label: "SMS" },
  { id: "identity", label: "CEP/CPF" },
  { id: "compliance", label: "LGPD/NFe" },
  { id: "i18n", label: "i18n" },
  { id: "analytics", label: "Analytics" },
  { id: "security", label: "Segurança" },
] as const;

export function StackBuilder() {
  const { config, basePreset, setState } = useStackConfig();
  const [step, setStep] = useState<StepId>("platform");
  const [mode, setMode] = useState<BuilderMode>("full");
  const [extraPlatforms, setExtraPlatforms] = useState(
    () => config.mobile !== "none" || config.desktop !== "none",
  );
  const [moduleSearch, setModuleSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [shareCopied, setShareCopied] = useState(false);
  const [pending, setPending] = useState<{
    title: string;
    primaryReason: string;
    changes: ConfigChange[];
    apply: () => void;
  } | null>(null);

  const visibleSteps = mode === "quick" ? STEPS.filter((s) => QUICK_STEPS.includes(s.id)) : STEPS;
  const command = useMemo(() => buildCommand(config), [config]);
  const errors = useMemo(() => validateConfig(config), [config]);

  const customizedFromPreset =
    config.preset === "custom" && basePreset && basePreset !== "custom" && basePreset in PRESETS
      ? PRESETS[basePreset as keyof typeof PRESETS].label
      : null;

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    void navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1500);
  }

  function applyPreset(id: keyof typeof PRESETS) {
    const p = PRESETS[id].config;
    const repaired = repairStackConfig({ ...p });
    void setState({
      preset: repaired.preset,
      basePreset: id,
      frontend: repaired.frontend,
      backend: repaired.backend,
      runtime: repaired.runtime,
      api: repaired.api,
      db: repaired.db,
      orm: repaired.orm,
      dbHosting: repaired.dbHosting,
      auth: repaired.auth,
      deploy: repaired.deploy,
      pm: repaired.pm,
      modules: repaired.modules,
      examples: repaired.examples,
      ui: repaired.ui,
      addons: repaired.addons,
      oxlintStrict: repaired.oxlintStrict,
      lefthookCi: repaired.lefthookCi,
      lefthookAdvanced: repaired.lefthookAdvanced,
    });
    if (mode === "quick") setStep("brazil");
  }

  function randomize() {
    const next = buildSurpriseConfig({
      projectName: config.projectName,
      git: config.git,
      install: config.install,
    });
    void setState({ ...next, basePreset: "custom" });
    setStep("review");
  }

  function toggleModule(id: ModuleId) {
    const has = config.modules.includes(id);
    if (has) {
      void setState({ modules: config.modules.filter((m) => m !== id), preset: "custom" });
      return;
    }
    const { newCfg, changes } = resolveEnableModule(config, id);
    if (changes.length === 0) {
      void setState({ modules: newCfg.modules, preset: "custom" });
      return;
    }
    setPending({
      title: `Ativar ${MODULES[id].name}?`,
      primaryReason: changes[changes.length - 1]?.reason ?? "Ajustes necessários no stack.",
      changes,
      apply: () => {
        void setState({
          frontend: newCfg.frontend,
          backend: newCfg.backend,
          runtime: newCfg.runtime,
          api: newCfg.api,
          db: newCfg.db,
          orm: newCfg.orm,
          dbHosting: newCfg.dbHosting,
          auth: newCfg.auth,
          deploy: newCfg.deploy,
          pm: newCfg.pm,
          ui: newCfg.ui,
          modules: newCfg.modules,
          preset: "custom",
        });
        setPending(null);
      },
    });
  }

  function applyGitHook(choice: GitHookChoice) {
    void setState({
      addons: patchAddonsForGitHook(config.addons, choice),
      preset: "custom",
      ...addonFlagsAfterGitHook(choice),
    });
  }

  function applyLinter(choice: LinterChoice) {
    void setState({
      addons: patchAddonsForLinter(config.addons, choice),
      preset: "custom",
      ...addonFlagsAfterLinter(choice),
    });
  }

  function applyTurborepo(on: boolean) {
    void setState({
      addons: patchAddonsTurborepo(config.addons, on),
      preset: "custom",
    });
  }

  function toggleExample(id: (typeof ExampleId.options)[number]) {
    if (id === "none") return;
    const has = config.examples.includes(id);
    void setState({
      examples: has ? config.examples.filter((e) => e !== id) : [...config.examples, id],
      preset: "custom",
    });
  }

  function requestChange(key: keyof ProjectConfig, value: string, labelForTitle?: string) {
    const current = (config as Record<string, unknown>)[key];
    if (current === value) return;
    const { newCfg, changes } = resolveConfig(config, { key, value });
    if (changes.length <= 1) {
      void setState({ [key]: value, preset: "custom" } as Parameters<typeof setState>[0]);
      return;
    }
    setPending({
      title: `Trocar para ${labelForTitle ?? value}?`,
      primaryReason: changes[0]?.reason || "Isso vai ajustar outras partes do stack.",
      changes,
      apply: () => {
        void setState({
          frontend: newCfg.frontend,
          backend: newCfg.backend,
          runtime: newCfg.runtime,
          api: newCfg.api,
          db: newCfg.db,
          orm: newCfg.orm,
          dbHosting: newCfg.dbHosting,
          auth: newCfg.auth,
          deploy: newCfg.deploy,
          pm: newCfg.pm,
          ui: newCfg.ui,
          modules: newCfg.modules,
          preset: "custom",
        });
        setPending(null);
      },
    });
  }

  function goToStepForKey(key: string) {
    if (key === "modules") {
      setMode("full");
      setStep("brazil");
      return;
    }
    if (["frontend", "mobile", "desktop", "backend", "runtime", "api", "ui"].includes(key)) {
      setStep("platform");
      return;
    }
    if (["db", "orm", "dbHosting", "auth", "deploy", "pm"].includes(key)) {
      setMode("full");
      setStep("data");
      return;
    }
    if (["addons", "examples"].includes(key)) {
      setMode("full");
      setStep("tools");
    }
  }

  const filteredModules = useMemo(() => {
    const q = moduleSearch.trim().toLowerCase();
    return Object.values(MODULES).filter((m) => {
      if (moduleFilter !== "all" && m.category !== moduleFilter) return false;
      if (!q) return true;
      const cat = MODULE_CATEGORY_LABELS[m.category].toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        cat.includes(q) ||
        m.id.includes(q)
      );
    });
  }, [moduleSearch, moduleFilter]);

  const stepIndex = visibleSteps.findIndex((s) => s.id === step);
  const progress =
    visibleSteps.length > 0 ? Math.round(((stepIndex + 1) / visibleSteps.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-11 border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 bg-background z-40">
        <div className="flex items-center gap-4">
          <Logo />
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Home
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={randomize}
            className="inline-flex items-center gap-1.5 text-xs h-8 px-3 border border-border-strong bg-secondary hover:bg-border-strong"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Surpreender</span>
          </button>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 text-xs h-8 px-3 border border-border-strong bg-secondary hover:bg-border-strong"
          >
            {shareCopied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{shareCopied ? "Copiado" : "Compartilhar"}</span>
          </button>
        </div>
      </header>

      {/* Preset + project bar */}
      <div className="border-b border-border bg-secondary/20 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-0">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5">
              Nome do projeto
            </label>
            <input
              type="text"
              value={config.projectName}
              onChange={(e) => void setState({ name: e.target.value || "my-veloz-stack" })}
              className="w-full max-w-xs bg-background border border-input h-9 px-3 text-sm font-mono focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ModeToggle mode={mode} onChange={setMode} />
            <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={config.install}
                onChange={(e) => void setState({ install: e.target.checked })}
                className="accent-brand"
              />
              deps
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={config.git}
                onChange={(e) => void setState({ git: e.target.checked })}
                className="accent-brand"
              />
              git
            </label>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-1">
          {Object.entries(PRESETS).map(([id, p]) => {
            const isActive = config.preset === id;
            const isBase = config.preset === "custom" && basePreset === id && id !== "custom";
            const comingSoon = COMING_SOON_PRESETS.includes(
              id as (typeof COMING_SOON_PRESETS)[number],
            );
            return (
              <button
                key={id}
                type="button"
                disabled={comingSoon}
                onClick={() => {
                  if (!comingSoon) applyPreset(id as keyof typeof PRESETS);
                }}
                title={comingSoon ? "Em breve" : undefined}
                className={
                  "shrink-0 text-left px-3 py-2 border min-w-[140px] max-w-[200px] transition-colors " +
                  (comingSoon
                    ? "opacity-50 cursor-not-allowed border-border"
                    : isActive
                      ? "border-brand bg-brand-subtle"
                      : isBase
                        ? "border-brand/50 bg-brand/5"
                        : "border-border hover:border-border-strong hover:bg-secondary")
                }
              >
                <div className="font-medium text-sm text-foreground">{p.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                  {p.description}
                </div>
              </button>
            );
          })}
        </div>
        {customizedFromPreset ? (
          <p className="max-w-6xl mx-auto mt-2 text-[11px] text-muted-foreground">
            Baseado em <span className="text-foreground font-medium">{customizedFromPreset}</span>
            {" · "}personalizado
          </p>
        ) : null}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[200px_minmax(0,1fr)_300px] min-h-0">
        {/* Step nav — desktop sidebar */}
        <nav className="hidden xl:block border-r border-border bg-secondary/20 p-4 sticky top-11 self-start h-[calc(100vh-44px)] overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
            Passos · {progress}%
          </div>
          <ol className="space-y-1">
            {visibleSteps.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={
                    "w-full text-left px-3 py-2 border transition-colors " +
                    (step === s.id
                      ? "border-brand bg-brand-subtle text-brand"
                      : "border-transparent hover:bg-secondary text-foreground")
                  }
                >
                  <span className="text-[10px] text-muted-foreground font-mono mr-2">{i + 1}</span>
                  <span className="text-sm font-medium">{s.label}</span>
                  <div className="text-[10px] text-muted-foreground mt-0.5 pl-5">{s.short}</div>
                </button>
              </li>
            ))}
          </ol>
          {mode === "quick" ? (
            <button
              type="button"
              onClick={() => setMode("full")}
              className="mt-4 w-full text-xs text-brand hover:underline text-left px-1"
            >
              Mostrar passos avançados →
            </button>
          ) : null}
        </nav>

        {/* Main step content */}
        <main className="min-w-0 flex flex-col">
          {/* Mobile step tabs */}
          <div className="xl:hidden border-b border-border flex overflow-x-auto bg-secondary/30">
            {visibleSteps.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={
                  "shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors " +
                  (step === s.id
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground")
                }
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1 px-4 sm:px-6 py-6 pb-36 max-w-3xl">
            {step === "platform" && (
              <StepPlatform
                config={config}
                extraPlatforms={extraPlatforms}
                onExtraPlatformsChange={setExtraPlatforms}
                requestChange={requestChange}
              />
            )}
            {step === "data" && <StepData config={config} requestChange={requestChange} />}
            {step === "brazil" && (
              <StepBrazil
                config={config}
                modules={filteredModules}
                moduleSearch={moduleSearch}
                onModuleSearchChange={setModuleSearch}
                moduleFilter={moduleFilter}
                onModuleFilterChange={setModuleFilter}
                onToggleModule={toggleModule}
              />
            )}
            {step === "tools" && (
              <StepTools
                config={config}
                onGitHookChange={applyGitHook}
                onLinterChange={applyLinter}
                onTurborepoChange={applyTurborepo}
                onToggleExample={toggleExample}
                setState={setState}
              />
            )}
            {step === "review" && (
              <StepReview
                config={config}
                command={command}
                errors={errors}
                onEdit={goToStepForKey}
              />
            )}

            <StepFooter visibleSteps={visibleSteps} step={step} onStep={setStep} />
          </div>
        </main>

        {/* Right: summary + preview */}
        <aside className="hidden lg:flex flex-col border-l border-border bg-secondary/20 lg:sticky lg:top-11 lg:self-start lg:h-[calc(100vh-44px)]">
          <SummaryPanel config={config} onJump={goToStepForKey} />
          <div className="flex-1 min-h-0 border-t border-border">
            <PreviewPanel config={config} />
          </div>
        </aside>
      </div>

      {step !== "review" ? (
        <div className="fixed bottom-0 left-0 right-0 lg:right-[300px] xl:right-[300px] border-t border-border bg-background/95 backdrop-blur z-30 pb-[env(safe-area-inset-bottom)]">
          <div className="px-4 sm:px-6 py-2.5 flex items-center gap-3 min-w-0">
            <code className="flex-1 min-w-0 font-mono text-[10px] sm:text-xs text-muted-foreground truncate">
              <span className="text-brand">$</span> {command}
            </code>
            <CopyButton value={command} label="Copiar" className="shrink-0" />
          </div>
        </div>
      ) : null}

      <ConfirmCascadeDialog
        open={pending !== null}
        title={pending?.title ?? ""}
        primaryReason={pending?.primaryReason ?? ""}
        changes={pending?.changes ?? []}
        onConfirm={() => pending?.apply()}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: BuilderMode; onChange: (m: BuilderMode) => void }) {
  return (
    <div className="inline-flex border border-border-strong text-[11px]">
      <button
        type="button"
        onClick={() => onChange("quick")}
        className={
          "px-2.5 py-1.5 transition-colors " +
          (mode === "quick" ? "bg-brand text-brand-foreground" : "hover:bg-secondary")
        }
      >
        Rápido
      </button>
      <button
        type="button"
        onClick={() => onChange("full")}
        className={
          "px-2.5 py-1.5 border-l border-border-strong transition-colors " +
          (mode === "full" ? "bg-brand text-brand-foreground" : "hover:bg-secondary")
        }
      >
        Completo
      </button>
    </div>
  );
}

function StepFooter({
  visibleSteps,
  step,
  onStep,
}: {
  visibleSteps: typeof STEPS;
  step: StepId;
  onStep: (s: StepId) => void;
}) {
  const idx = visibleSteps.findIndex((s) => s.id === step);
  const prev = visibleSteps[idx - 1];
  const next = visibleSteps[idx + 1];
  if (!prev && !next) return null;
  return (
    <div className="mt-10 flex justify-between gap-3">
      {prev ? (
        <button
          type="button"
          onClick={() => onStep(prev.id)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← {prev.label}
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button
          type="button"
          onClick={() => onStep(next.id)}
          className="text-xs font-medium text-brand hover:underline inline-flex items-center gap-1"
        >
          {next.label} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-heading text-xl font-semibold" data-heading>
        {children}
      </h2>
      {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
      {children}
    </div>
  );
}

function OptionChip({
  id,
  label,
  sectionKey,
  active,
  disabledReason,
  brandHint,
  onSelect,
}: {
  id: string;
  label: string;
  sectionKey: string;
  active: boolean;
  disabledReason: string | null;
  brandHint?: boolean;
  onSelect: () => void;
}) {
  const needsAdjust = !active && disabledReason !== null;
  const hint = getHint(id, sectionKey);
  return (
    <button
      type="button"
      disabled={needsAdjust}
      onClick={() => {
        if (needsAdjust) return;
        onSelect();
      }}
      title={needsAdjust ? (disabledReason ?? undefined) : (hint ?? undefined)}
      aria-pressed={active}
      className={
        "inline-flex items-center gap-2 h-9 px-2.5 border text-left transition-colors max-w-full " +
        (active
          ? "border-brand bg-brand-subtle"
          : needsAdjust
            ? "border-warning/40 bg-warning/5 opacity-50 cursor-not-allowed"
            : brandHint
              ? "border-brand/40 bg-brand/5"
              : "border-border hover:border-border-strong hover:bg-secondary")
      }
    >
      <BrandLogo id={id} label={label} height={20} />
      <span className={`text-xs font-medium truncate ${active ? "text-brand" : "text-foreground"}`}>
        {label}
      </span>
      {brandHint && !active ? (
        <span className="text-[8px] font-bold px-1 bg-brand/20 text-brand uppercase">★</span>
      ) : null}
    </button>
  );
}

function ChipRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <SubLabel>{label}</SubLabel>
      {hint ? <p className="text-[11px] text-muted-foreground mb-2 -mt-1">{hint}</p> : null}
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function StepPlatform({
  config,
  extraPlatforms,
  onExtraPlatformsChange,
  requestChange,
}: {
  config: ProjectConfig;
  extraPlatforms: boolean;
  onExtraPlatformsChange: (v: boolean) => void;
  requestChange: (key: keyof ProjectConfig, value: string, label?: string) => void;
}) {
  const runtimeHint =
    config.frontend === "next" && config.backend === "next"
      ? "Com Route Handlers, Bun e Node são válidos. Workers exige Hono."
      : undefined;

  return (
    <>
      <SectionTitle hint="Escolha a base do app. O restante do stack se adapta.">
        Plataforma
      </SectionTitle>

      <ChipRow label="Frontend (web)">
        {FrontendId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={labelsFrontend(id)}
            sectionKey="frontend"
            active={config.frontend === id}
            disabledReason={getFrontendDisableReason(config, id)}
            onSelect={() => requestChange("frontend", id, labelsFrontend(id))}
          />
        ))}
      </ChipRow>

      <div className="border border-border p-4 bg-secondary/30 mb-5">
        <SubLabel>Camada API</SubLabel>
        <ChipRow label="Backend">
          {BackendId.options.map((id) => (
            <OptionChip
              key={id}
              id={id}
              label={labelsBackend(id)}
              sectionKey="backend"
              active={config.backend === id}
              disabledReason={getBackendDisableReason(config, id)}
              onSelect={() => requestChange("backend", id, labelsBackend(id))}
            />
          ))}
        </ChipRow>
        <ChipRow label="Runtime" hint={runtimeHint}>
          {RuntimeId.options.map((id) => (
            <OptionChip
              key={id}
              id={id}
              label={titleCase(id)}
              sectionKey="runtime"
              active={config.runtime === id}
              disabledReason={getRuntimeDisableReason(config, id)}
              onSelect={() => requestChange("runtime", id, titleCase(id))}
            />
          ))}
        </ChipRow>
        <ChipRow label="Estilo de API">
          {ApiId.options.map((id) => (
            <OptionChip
              key={id}
              id={id}
              label={labelsApi(id)}
              sectionKey="api"
              active={config.api === id}
              disabledReason={getApiDisableReason(config, id)}
              onSelect={() => requestChange("api", id, labelsApi(id))}
            />
          ))}
        </ChipRow>
      </div>

      <ChipRow label="UI">
        {UiId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={labelsUi(id)}
            sectionKey="ui"
            active={config.ui === id}
            disabledReason={getUiDisableReason(config, id)}
            onSelect={() => requestChange("ui", id, labelsUi(id))}
          />
        ))}
      </ChipRow>

      <button
        type="button"
        onClick={() => onExtraPlatformsChange(!extraPlatforms)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${extraPlatforms ? "rotate-180" : ""}`}
        />
        Plataformas extras (mobile / desktop)
      </button>
      {extraPlatforms ? (
        <>
          <ChipRow label="Mobile">
            {MobileId.options.map((id) => (
              <OptionChip
                key={id}
                id={id}
                label={id === "expo" ? "Expo" : "Nenhum"}
                sectionKey="mobile"
                active={config.mobile === id}
                disabledReason={null}
                onSelect={() => requestChange("mobile", id)}
              />
            ))}
          </ChipRow>
          <ChipRow label="Desktop">
            {DesktopId.options.map((id) => (
              <OptionChip
                key={id}
                id={id}
                label={id === "tauri" ? "Tauri" : "Nenhum"}
                sectionKey="desktop"
                active={config.desktop === id}
                disabledReason={null}
                onSelect={() => requestChange("desktop", id)}
              />
            ))}
          </ChipRow>
        </>
      ) : null}
    </>
  );
}

function StepData({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: (key: keyof ProjectConfig, value: string, label?: string) => void;
}) {
  return (
    <>
      <SectionTitle hint="Persistência, auth e onde o app vai rodar.">Dados & deploy</SectionTitle>

      <div className="border border-border p-4 bg-secondary/30 mb-5">
        <SubLabel>Banco de dados</SubLabel>
        <ChipRow label="Engine">
          {DbId.options.map((id) => (
            <OptionChip
              key={id}
              id={id}
              label={titleCase(id)}
              sectionKey="db"
              active={config.db === id}
              disabledReason={null}
              onSelect={() => requestChange("db", id, titleCase(id))}
            />
          ))}
        </ChipRow>
        {config.db !== "none" ? (
          <>
            <ChipRow label="ORM">
              {OrmId.options.map((id) => (
                <OptionChip
                  key={id}
                  id={id}
                  label={titleCase(id)}
                  sectionKey="orm"
                  active={config.orm === id}
                  disabledReason={getOrmDisableReason(config, id)}
                  onSelect={() => requestChange("orm", id, titleCase(id))}
                />
              ))}
            </ChipRow>
            <ChipRow label="Hospedagem">
              {DbHostingId.options.map((id) => (
                <OptionChip
                  key={id}
                  id={id}
                  label={labelsDbHost(id)}
                  sectionKey="dbHosting"
                  active={config.dbHosting === id}
                  disabledReason={getDbHostingDisableReason(config, id)}
                  brandHint={id === "veloz"}
                  onSelect={() => requestChange("dbHosting", id, labelsDbHost(id))}
                />
              ))}
            </ChipRow>
          </>
        ) : null}
      </div>

      <ChipRow label="Autenticação">
        {AuthId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={labelsAuth(id)}
            sectionKey="auth"
            active={config.auth === id}
            disabledReason={getAuthDisableReason(config, id)}
            onSelect={() => requestChange("auth", id, labelsAuth(id))}
          />
        ))}
      </ChipRow>

      <ChipRow
        label="Deploy"
        hint="Stack opinado Veloz: `npx onveloz deploy`, Dockerfile e health checks no repo."
      >
        {DeployId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={labelsDeploy(id)}
            sectionKey="deploy"
            active={config.deploy === id}
            disabledReason={getDeployDisableReason(config, id)}
            brandHint={id === "veloz"}
            onSelect={() => requestChange("deploy", id, labelsDeploy(id))}
          />
        ))}
      </ChipRow>

      <ChipRow label="Gerenciador de pacotes">
        {PackageManagerId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={titleCase(id)}
            sectionKey="pm"
            active={config.pm === id}
            disabledReason={null}
            onSelect={() => requestChange("pm", id, titleCase(id))}
          />
        ))}
      </ChipRow>
    </>
  );
}

function ModuleListSection({
  title,
  hint,
  mods,
  config,
  onToggleModule,
}: {
  title: string;
  hint?: string;
  mods: ModuleMeta[];
  config: ProjectConfig;
  onToggleModule: (id: ModuleId) => void;
}) {
  const byCategory = MODULE_CATEGORIES.map((cat) => ({
    cat,
    items: mods.filter((m) => m.category === cat),
  })).filter((g) => g.items.length > 0);

  if (mods.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
      </div>
      {byCategory.map(({ cat, items }) => (
        <div key={cat}>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            {MODULE_CATEGORY_LABELS[cat]}
          </div>
          <ul className="border border-border divide-y divide-border">
            {items.map((m) => {
              const active = config.modules.includes(m.id);
              const reason = getModuleDisableReason(config, m.id);
              const needsAdjust = !active && reason !== null;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onToggleModule(m.id)}
                    title={needsAdjust ? (reason ?? undefined) : m.tagline}
                    className={
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors " +
                      (active
                        ? "bg-brand-subtle"
                        : needsAdjust
                          ? "bg-warning/5"
                          : "hover:bg-secondary")
                    }
                  >
                    <BrandLogo id={m.id} label={m.name} height={22} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">{m.name}</span>
                        {m.brazilian ? (
                          <span className="text-[9px] font-bold px-1 bg-success/20 text-success">
                            BR
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{m.tagline}</div>
                    </div>
                    <div
                      className={
                        "w-4 h-4 border flex items-center justify-center shrink-0 " +
                        (active ? "bg-brand border-brand" : "border-border-strong")
                      }
                    >
                      {active ? <Check className="w-3 h-3 text-brand-foreground" /> : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function StepBrazil({
  config,
  modules,
  moduleSearch,
  onModuleSearchChange,
  moduleFilter,
  onModuleFilterChange,
  onToggleModule,
}: {
  config: ProjectConfig;
  modules: ModuleMeta[];
  moduleSearch: string;
  onModuleSearchChange: (v: string) => void;
  moduleFilter: string;
  onModuleFilterChange: (v: string) => void;
  onToggleModule: (id: ModuleId) => void;
}) {
  const brazilMods = modules.filter((m) => isBrazilModule(m.id));
  const globalMods = modules.filter((m) => !isBrazilModule(m.id));

  return (
    <>
      <SectionTitle hint="Integrações BR (PIX, LGPD, CEP…) e globais (Claude, Sentry, email…).">
        Módulos & integrações
      </SectionTitle>
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        <span className="text-brand font-medium tabular-nums">{config.modules.length}</span> ativos
        {config.preset === "veloz-br" ? " · preset Veloz BR já inclui o essencial" : ""}
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            value={moduleSearch}
            onChange={(e) => onModuleSearchChange(e.target.value)}
            placeholder="Buscar módulo…"
            className="w-full h-9 pl-8 pr-3 bg-background border border-input text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {MODULE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onModuleFilterChange(f.id)}
              className={
                "text-[11px] px-2 py-1 border transition-colors " +
                (moduleFilter === f.id
                  ? "border-brand bg-brand-subtle text-brand"
                  : "border-border hover:bg-secondary")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <ModuleListSection
          title="Brasil"
          hint="Pagamentos PIX, mensageria BR, identidade, LGPD e formatadores pt-BR."
          mods={brazilMods}
          config={config}
          onToggleModule={onToggleModule}
        />
        <ModuleListSection
          title="Global"
          hint="IA (Claude), observabilidade, email, storage e auth — não são exclusivos do Brasil."
          mods={globalMods}
          config={config}
          onToggleModule={onToggleModule}
        />
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhum módulo encontrado.
          </p>
        ) : null}
      </div>
    </>
  );
}

function StepTools({
  config,
  onGitHookChange,
  onLinterChange,
  onTurborepoChange,
  onToggleExample,
  setState,
}: {
  config: ProjectConfig;
  onGitHookChange: (choice: GitHookChoice) => void;
  onLinterChange: (choice: LinterChoice) => void;
  onTurborepoChange: (on: boolean) => void;
  onToggleExample: (id: (typeof ExampleId.options)[number]) => void;
  setState: ReturnType<typeof useStackConfig>["setState"];
}) {
  return (
    <>
      <SectionTitle hint="Lint, monorepo, hooks e starters opcionais.">
        Ferramentas & exemplos
      </SectionTitle>

      <SubLabel>Ferramentas DX</SubLabel>
      <div className="mb-6">
        <StackAddonPickers
          config={config}
          onGitHookChange={onGitHookChange}
          onLinterChange={onLinterChange}
          onTurborepoChange={onTurborepoChange}
          onOxlintStrictChange={() =>
            void setState({ oxlintStrict: !config.oxlintStrict, preset: "custom" })
          }
          onLefthookCiChange={() =>
            void setState({
              lefthookCi: !config.lefthookCi,
              lefthookAdvanced: false,
              preset: "custom",
            })
          }
          onLefthookAdvancedChange={() =>
            void setState({
              lefthookAdvanced: !config.lefthookAdvanced,
              lefthookCi: false,
              preset: "custom",
            })
          }
        />
      </div>

      <SubLabel>Exemplos prontos</SubLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(
          ExampleId.options.filter((id) => id !== "none") as Array<
            Exclude<(typeof ExampleId.options)[number], "none">
          >
        ).map((id) => {
          const active = config.examples.includes(id);
          const meta = EXAMPLE_META[id]!;
          const comingSoon = id === "ai-chat";
          return (
            <button
              key={id}
              type="button"
              disabled={comingSoon}
              onClick={() => !comingSoon && onToggleExample(id)}
              className={
                "text-left p-3 border flex gap-3 items-start " +
                (comingSoon
                  ? "opacity-50 cursor-not-allowed"
                  : active
                    ? "border-brand bg-brand-subtle"
                    : "border-border hover:bg-secondary")
              }
            >
              <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">{meta.label}</div>
                <div className="text-[11px] text-muted-foreground">{meta.tagline}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepReview({
  config,
  command,
  errors,
  onEdit,
}: {
  config: ProjectConfig;
  command: string;
  errors: string[];
  onEdit: (key: string) => void;
}) {
  const rows: { key: string; label: string; value: string }[] = [
    { key: "frontend", label: "Frontend", value: labelsFrontend(config.frontend) },
    { key: "backend", label: "Backend", value: labelsBackend(config.backend) },
    { key: "runtime", label: "Runtime", value: titleCase(config.runtime) },
    { key: "api", label: "API", value: labelsApi(config.api) },
    {
      key: "db",
      label: "Banco",
      value: `${titleCase(config.db)}${config.dbHosting !== "none" ? ` · ${labelsDbHost(config.dbHosting)}` : ""}`,
    },
    { key: "auth", label: "Auth", value: labelsAuth(config.auth) },
    { key: "deploy", label: "Deploy", value: labelsDeploy(config.deploy) },
    { key: "modules", label: "Módulos", value: `${config.modules.length} ativos` },
    { key: "addons", label: "Ferramentas", value: config.addons.join(", ") || "—" },
  ];

  return (
    <>
      <SectionTitle>Revisar e gerar</SectionTitle>
      <p className="text-sm text-muted-foreground mb-6">
        Confira o stack. Clique em um item para editar.
      </p>

      <ul className="border border-border divide-y divide-border mb-6">
        {rows.map((r) => (
          <li key={r.key}>
            <button
              type="button"
              onClick={() => onEdit(r.key)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-secondary text-sm"
            >
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-mono text-foreground truncate">{r.value}</span>
            </button>
          </li>
        ))}
      </ul>

      {errors.length > 0 ? (
        <div className="border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6">
          <div className="font-semibold mb-1">Combinação inválida</div>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border border-brand/40 bg-brand/5 p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Rode este comando
        </div>
        <code className="block font-mono text-xs sm:text-sm text-foreground break-all leading-relaxed mb-4">
          <span className="text-brand">$</span> {command}
        </code>
        <CopyButton
          value={command}
          label="Copiar e rodar"
          className="w-full sm:w-auto bg-brand text-brand-foreground border-brand hover:bg-brand-hover h-10 px-4 text-sm font-medium"
        />
      </div>

      <div className="lg:hidden mt-8 border border-border overflow-hidden">
        <PreviewPanel config={config} maxHeight={240} />
      </div>
    </>
  );
}

function SummaryPanel({
  config,
  onJump,
}: {
  config: ProjectConfig;
  onJump: (key: string) => void;
}) {
  const chips: { key: string; value: string }[] = [
    { key: "frontend", value: labelsFrontend(config.frontend) },
    { key: "backend", value: labelsBackend(config.backend) },
    { key: "db", value: titleCase(config.db) },
    { key: "deploy", value: labelsDeploy(config.deploy) },
    { key: "modules", value: String(config.modules.length) },
  ];

  return (
    <div className="p-4 shrink-0">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        Stack ativo
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onJump(c.key)}
            className="text-[11px] font-mono px-2 py-1 border border-border hover:border-brand hover:bg-brand-subtle transition-colors"
          >
            <span className="text-muted-foreground">{c.key}</span>{" "}
            <span className="text-foreground">{c.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
