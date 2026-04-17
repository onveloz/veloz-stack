"use client";

import Link from "next/link";
import { ArrowLeft, Check, Share2, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AddonId,
  ApiId,
  AuthId,
  BackendId,
  DbHostingId,
  DbId,
  DeployId,
  ExampleId,
  FrontendId,
  MODULES,
  MODULE_CATEGORIES,
  MODULE_CATEGORY_LABELS,
  OrmId,
  PRESETS,
  PackageManagerId,
  RuntimeId,
  getApiDisableReason,
  getBackendDisableReason,
  getDbHostingDisableReason,
  getDeployDisableReason,
  getFrontendDisableReason,
  getModuleDisableReason,
  getOrmDisableReason,
  getRuntimeDisableReason,
  type ModuleId,
  validateConfig,
} from "@veloz-stack/types";
import { buildCommand } from "@/lib/build-command";
import { getHint } from "@/lib/option-hints";
import { useStackConfig } from "@/lib/use-stack-config";
import { Logo } from "@/components/logo";
import { BrandLogo } from "@/components/brand-logo";
import { CopyButton } from "@/components/copy-button";
import { ConfirmCascadeDialog } from "@/components/confirm-dialog";
import { PreviewPanel } from "./preview-panel";
import { resolveConfig, type ConfigChange } from "@/lib/resolve-config";

type OptionTile = {
  id: string;
  label: string;
  hint?: string;
  brandHint?: boolean;
};

export function StackBuilder() {
  const { config, setState } = useStackConfig();
  const command = useMemo(() => buildCommand(config), [config]);
  const errors = useMemo(() => validateConfig(config), [config]);

  const [shareCopied, setShareCopied] = useState(false);
  const [pending, setPending] = useState<
    | {
        title: string;
        primaryReason: string;
        changes: ConfigChange[];
        apply: () => void;
      }
    | null
  >(null);

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    void navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1500);
  }

  function applyPreset(id: keyof typeof PRESETS) {
    const p = PRESETS[id].config;
    void setState({
      preset: p.preset,
      frontend: p.frontend,
      backend: p.backend,
      runtime: p.runtime,
      api: p.api,
      db: p.db,
      orm: p.orm,
      dbHosting: p.dbHosting,
      auth: p.auth,
      deploy: p.deploy,
      pm: p.pm,
      modules: p.modules,
      examples: p.examples,
    });
  }

  function randomize() {
    const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)]!;

    const db = pick(["postgres", "sqlite"] as const);
    const dbHosting = db === "sqlite" ? "turso" : "veloz";

    void setState({
      preset: "custom",
      frontend: pick(FrontendId.options),
      backend: pick(BackendId.options.filter((b) => b !== "none")),
      runtime: pick(RuntimeId.options.filter((r) => r !== "workers")),
      api: pick(["orpc", "trpc", "rest"] as const),
      db,
      orm: "drizzle",
      dbHosting,
      auth: pick(AuthId.options),
      deploy: pick(DeployId.options.filter((d) => d !== "none" && d !== "cloudflare")),
      pm: pick(PackageManagerId.options),
      modules: Math.random() > 0.5 ? config.modules : [],
      examples: [],
      addons: ["turborepo"],
    });
  }

  function toggleModule(id: ModuleId) {
    const has = config.modules.includes(id);
    void setState({
      modules: has ? config.modules.filter((m) => m !== id) : [...config.modules, id],
      preset: "custom",
    });
  }

  function toggleAddon(id: (typeof AddonId.options)[number]) {
    const has = config.addons.includes(id);
    void setState({
      addons: has ? config.addons.filter((a) => a !== id) : [...config.addons, id],
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

  function requestChange(key: keyof typeof config, value: string, labelForTitle?: string) {
    const current = (config as any)[key];
    if (current === value) return;

    const { newCfg, changes } = resolveConfig(config, { key, value });
    const cascade = changes.slice(1);

    // No conflict — just apply
    if (cascade.length === 0) {
      void setState({ [key]: value, preset: "custom" } as any);
      return;
    }

    // Open confirm dialog
    setPending({
      title: `Switch to ${labelForTitle ?? value}?`,
      primaryReason: changes[0]?.reason || "This will reshape your stack.",
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
          modules: newCfg.modules,
          preset: "custom",
        });
        setPending(null);
      },
    });
  }

  const categories: Array<{
    key: keyof typeof config;
    label: string;
    tiles: OptionTile[];
    getDisabled: (id: string) => string | null;
  }> = [
    {
      key: "frontend",
      label: "Frontend",
      tiles: tiles(FrontendId.options, labelsFrontend),
      getDisabled: (id) => getFrontendDisableReason(config, id as any),
    },
    {
      key: "backend",
      label: "Backend",
      tiles: tiles(BackendId.options, titleCase),
      getDisabled: (id) => getBackendDisableReason(config, id as any),
    },
    {
      key: "runtime",
      label: "Runtime",
      tiles: tiles(RuntimeId.options, titleCase),
      getDisabled: (id) => getRuntimeDisableReason(config, id as any),
    },
    {
      key: "api",
      label: "API",
      tiles: tiles(ApiId.options, (s) => (s === "orpc" ? "oRPC" : s === "trpc" ? "tRPC" : titleCase(s))),
      getDisabled: (id) => getApiDisableReason(config, id as any),
    },
    {
      key: "db",
      label: "Banco de dados",
      tiles: tiles(DbId.options, titleCase),
      getDisabled: () => null,
    },
    {
      key: "orm",
      label: "ORM",
      tiles: tiles(OrmId.options, titleCase),
      getDisabled: (id) => getOrmDisableReason(config, id as any),
    },
    {
      key: "dbHosting",
      label: "Hospedagem do banco",
      tiles: tiles(DbHostingId.options, labelsDbHost, "veloz"),
      getDisabled: (id) => getDbHostingDisableReason(config, id as any),
    },
    {
      key: "auth",
      label: "Autenticação",
      tiles: tiles(AuthId.options, (s) =>
        s === "better-auth" ? "Better Auth" : s === "clerk" ? "Clerk" : "Nenhuma",
      ),
      getDisabled: () => null,
    },
    {
      key: "deploy",
      label: "Alvo de deploy",
      tiles: tiles(DeployId.options, labelsDeploy, "veloz"),
      getDisabled: (id) => getDeployDisableReason(config, id as any),
    },
    {
      key: "pm",
      label: "Gerenciador de pacotes",
      tiles: tiles(PackageManagerId.options, titleCase),
      getDisabled: () => null,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-11 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background z-40">
        <div className="flex items-center gap-4">
          <Logo />
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Home
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={randomize}
            className="inline-flex items-center gap-1.5 text-xs h-8 px-3 border border-border-strong bg-secondary hover:bg-border-strong"
            title="Gerar uma combinação aleatória"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Surpreender
          </button>
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 text-xs h-8 px-3 border border-border-strong bg-secondary hover:bg-border-strong"
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Share2 className="w-3.5 h-3.5" />}
            {shareCopied ? "Link copiado" : "Compartilhar"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] min-h-[calc(100vh-44px)]">
        {/* Left sidebar */}
        <aside className="border-r border-border bg-secondary/30 p-5 lg:sticky lg:top-11 lg:self-start lg:h-[calc(100vh-44px)] lg:overflow-y-auto">
          <div className="mb-5">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5">
              Nome do projeto
            </label>
            <input
              type="text"
              value={config.projectName}
              onChange={(e) => void setState({ name: e.target.value || "my-veloz-stack" })}
              className="w-full bg-background border border-input h-8 px-2 text-sm font-mono focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
            />
          </div>

          <div className="mb-5">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5">
              Modelo pronto
            </label>
            <div className="flex flex-col gap-1">
              {Object.entries(PRESETS).map(([id, p]) => (
                <button
                  key={id}
                  onClick={() => applyPreset(id as keyof typeof PRESETS)}
                  className={
                    "text-left text-xs px-2 py-1.5 border transition-colors " +
                    (config.preset === id
                      ? "border-brand bg-brand-subtle text-brand"
                      : "border-border hover:border-border-strong hover:bg-secondary")
                  }
                >
                  <div className="font-medium text-foreground">{p.label}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Stack escolhido
            </div>
            <ul className="text-xs space-y-1 font-mono">
              <StackLine k="frontend" v={config.frontend} />
              <StackLine k="backend" v={config.backend} />
              <StackLine k="runtime" v={config.runtime} />
              <StackLine k="api" v={config.api} />
              <StackLine k="db" v={`${config.db}${config.dbHosting !== "none" ? ` · ${config.dbHosting}` : ""}`} />
              <StackLine k="orm" v={config.orm} />
              <StackLine k="auth" v={config.auth} />
              <StackLine k="deploy" v={config.deploy} />
              <StackLine k="módulos" v={`${config.modules.length} ativos`} />
            </ul>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={config.install}
                onChange={(e) => void setState({ install: e.target.checked })}
                className="accent-brand"
              />
              instalar deps
            </label>
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={config.git}
                onChange={(e) => void setState({ git: e.target.checked })}
                className="accent-brand"
              />
              git init
            </label>
          </div>

          {errors.length > 0 && (
            <div className="border border-destructive/50 bg-destructive/10 p-2 text-[11px] text-destructive">
              <div className="font-semibold mb-1">Combinação inválida:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Center: category grid */}
        <main className="px-6 py-6 pb-40">
          {categories.map((cat) => (
            <CategorySection
              key={cat.key as string}
              label={cat.label}
              tiles={cat.tiles}
              selected={config[cat.key] as string}
              getDisabled={cat.getDisabled}
              onSelect={(id, label) => requestChange(cat.key as any, id, label)}
            />
          ))}

          {/* Modules grouped by category */}
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-heading text-lg font-semibold">Módulos de funcionalidade</h2>
              <span className="text-xs text-muted-foreground">
                {config.modules.length} ativos · clique pra ligar/desligar
              </span>
            </div>
            {MODULE_CATEGORIES.map((cat) => {
              const mods = Object.values(MODULES).filter((m) => m.category === cat);
              if (mods.length === 0) return null;
              return (
                <div key={cat} className="mb-5">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                    {MODULE_CATEGORY_LABELS[cat]}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {mods.map((m) => {
                      const active = config.modules.includes(m.id);
                      const reason = getModuleDisableReason(config, m.id);
                      const disabled = !active && reason !== null;
                      return (
                        <button
                          key={m.id}
                          onClick={() => !disabled && toggleModule(m.id)}
                          disabled={disabled}
                          title={reason ?? undefined}
                          className={
                            "group text-left p-3 border transition-colors relative flex items-center gap-3 min-h-[64px] " +
                            (active
                              ? "border-brand bg-brand-subtle"
                              : disabled
                              ? "border-border bg-secondary/30 opacity-40 cursor-not-allowed"
                              : "border-border hover:border-border-strong hover:bg-secondary")
                          }
                        >
                          <div className="flex items-center h-10 shrink-0">
                            <BrandLogo id={m.id} label={m.name} height={28} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <div className="font-medium text-sm truncate">{m.name}</div>
                              {m.brazilian && (
                                <span className="text-[9px] font-bold px-1 bg-success/20 text-success">
                                  BR
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                              {m.tagline}
                            </div>
                          </div>
                          <div
                            className={
                              "w-4 h-4 border flex items-center justify-center shrink-0 " +
                              (active ? "bg-brand border-brand" : "border-border-strong")
                            }
                          >
                            {active && <Check className="w-3 h-3 text-brand-foreground" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Addons */}
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-heading text-lg font-semibold">Ferramentas</h2>
              <span className="text-xs text-muted-foreground">
                {config.addons.length} de {AddonId.options.length} ativas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {AddonId.options.map((id) => {
                const active = config.addons.includes(id);
                const meta = ADDON_META[id];
                return (
                  <button
                    key={id}
                    onClick={() => toggleAddon(id)}
                    className={
                      "group text-left p-3 border transition-colors relative flex items-center gap-3 min-h-[64px] " +
                      (active
                        ? "border-brand bg-brand-subtle"
                        : "border-border hover:border-border-strong hover:bg-secondary")
                    }
                  >
                    <div className="flex items-center justify-center w-10 h-10 shrink-0">
                      <BrandLogo id={id} label={meta.label} height={28} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{meta.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {meta.tagline}
                      </div>
                    </div>
                    <div
                      className={
                        "w-4 h-4 border flex items-center justify-center shrink-0 " +
                        (active ? "bg-brand border-brand" : "border-border-strong")
                      }
                    >
                      {active && <Check className="w-3 h-3 text-brand-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Examples */}
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-heading text-lg font-semibold">Exemplos prontos</h2>
              <span className="text-xs text-muted-foreground">
                {config.examples.length} selecionado{config.examples.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ExampleId.options
                .filter((id) => id !== "none")
                .map((id) => {
                  const active = config.examples.includes(id);
                  const meta = EXAMPLE_META[id];
                  return (
                    <button
                      key={id}
                      onClick={() => toggleExample(id)}
                      className={
                        "group text-left p-3 border transition-colors min-h-[64px] flex items-center gap-3 " +
                        (active
                          ? "border-brand bg-brand-subtle"
                          : "border-border hover:border-border-strong hover:bg-secondary")
                      }
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-secondary border border-border-strong shrink-0">
                        <span className="text-brand font-heading font-bold text-lg">
                          {meta.label[0]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{meta.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {meta.tagline}
                        </div>
                      </div>
                      <div
                        className={
                          "w-4 h-4 border flex items-center justify-center shrink-0 " +
                          (active ? "bg-brand border-brand" : "border-border-strong")
                        }
                      >
                        {active && <Check className="w-3 h-3 text-brand-foreground" />}
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>
        </main>

        {/* Right preview panel */}
        <aside className="hidden lg:block border-l border-border bg-secondary/20 lg:sticky lg:top-11 lg:self-start lg:h-[calc(100vh-44px)]">
          <PreviewPanel config={config} />
        </aside>
      </div>

      <ConfirmCascadeDialog
        open={pending !== null}
        title={pending?.title ?? ""}
        primaryReason={pending?.primaryReason ?? ""}
        changes={pending?.changes ?? []}
        onConfirm={() => pending?.apply()}
        onCancel={() => setPending(null)}
      />

      {/* Sticky bottom command bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur z-30">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:block">
            Rode este comando
          </span>
          <code className="flex-1 font-mono text-xs md:text-sm text-foreground bg-secondary border border-border-strong px-3 py-2 overflow-x-auto whitespace-nowrap">
            <span className="text-brand">$</span> {command}
          </code>
          <CopyButton value={command} label="Copiar comando" />
        </div>
      </div>
    </div>
  );
}

function StackLine({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-foreground truncate">{v}</span>
    </li>
  );
}

const ADDON_META: Record<(typeof AddonId.options)[number], { label: string; tagline: string }> = {
  turborepo: {
    label: "Turborepo",
    tagline: "Task graph + cache remoto — scripts da raiz viram `turbo run …`",
  },
  biome: {
    label: "Biome",
    tagline: "Formatador + linter — adiciona scripts format / lint / check",
  },
  husky: {
    label: "Husky + lint-staged",
    tagline: "Hook de pre-commit rodando lint-staged (Biome se ativo)",
  },
};

const EXAMPLE_META: Record<
  Exclude<(typeof ExampleId.options)[number], "none">,
  { label: string; tagline: string }
> = {
  todo: {
    label: "Todo CRUD",
    tagline: "Router oRPC + schema Drizzle + frontend — starter clássico",
  },
  "ai-chat": {
    label: "Chat IA (em breve)",
    tagline: "Chat com streaming via Claude — chega na próxima wave",
  },
  "pix-checkout": {
    label: "Checkout PIX",
    tagline: "QR AbacatePay + verifier de webhook + rota /checkout",
  },
};

function CategorySection({
  label,
  tiles,
  selected,
  getDisabled,
  onSelect,
}: {
  label: string;
  tiles: OptionTile[];
  selected: string;
  getDisabled: (id: string) => string | null;
  onSelect: (id: string, label: string) => void;
}) {
  return (
    <section className="mb-6">
      <h2 className="font-heading text-lg font-semibold mb-3">{label}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {tiles.map((t) => {
          const active = selected === t.id;
          const reason = getDisabled(t.id);
          const disabled = !active && reason !== null;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id, t.label)}
              title={reason ?? undefined}
              aria-disabled={disabled || undefined}
              className={
                "group text-left p-3 border transition-colors flex items-center gap-3 min-h-[64px] relative " +
                (active
                  ? "border-brand bg-brand-subtle"
                  : disabled
                  ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
                  : "border-border hover:border-border-strong hover:bg-secondary")
              }
            >
              <div className="flex items-center h-10 shrink-0">
                <BrandLogo id={t.id} label={t.label} height={28} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      "font-medium text-sm truncate " + (active ? "text-brand" : "text-foreground")
                    }
                  >
                    {t.label}
                  </span>
                  {t.brandHint && !active && (
                    <span className="text-[9px] font-bold px-1 bg-brand/20 text-brand">DEFAULT</span>
                  )}
                </div>
                {getHint(t.id) && (
                  <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {getHint(t.id)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function tiles(
  ids: readonly string[],
  label: (id: string) => string,
  brandHintId?: string,
): OptionTile[] {
  return ids.map((id) => ({
    id,
    label: label(id),
    brandHint: brandHintId === id,
  }));
}

function titleCase(s: string): string {
  if (s === "none") return "None";
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function labelsFrontend(id: string): string {
  const map: Record<string, string> = {
    "tanstack-start": "TanStack Start",
    next: "Next.js",
    nuxt: "Nuxt",
    "svelte-kit": "SvelteKit",
    astro: "Astro",
    "native-expo": "Expo (React Native)",
    none: "None",
  };
  return map[id] ?? titleCase(id);
}

function labelsDbHost(id: string): string {
  const map: Record<string, string> = {
    veloz: "Veloz",
    neon: "Neon",
    supabase: "Supabase",
    planetscale: "PlanetScale",
    turso: "Turso",
    "mongodb-atlas": "MongoDB Atlas",
    docker: "Docker (local)",
    none: "None",
  };
  return map[id] ?? titleCase(id);
}

function labelsDeploy(id: string): string {
  const map: Record<string, string> = {
    veloz: "Veloz",
    vercel: "Vercel",
    cloudflare: "Cloudflare",
    fly: "Fly.io",
    render: "Render",
    docker: "Docker",
    none: "None",
  };
  return map[id] ?? titleCase(id);
}
