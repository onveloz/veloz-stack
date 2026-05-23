"use client";

import {
  getModuleDisableReason,
  isBrazilModule,
  MODULE_CATEGORIES,
  MODULE_CATEGORY_LABELS,
} from "@veloz-stack/types";
import { Check, Search } from "lucide-react";

import type {
  ModuleId,
  ModuleMeta,
  ProjectConfig,
} from "@/lib/veloz-stack-types";

import { BrandLogo } from "@/components/brand-logo";

import { MODULE_FILTERS } from "./stack-builder-constants";
import { SectionTitle } from "./stack-builder-ui";

function ModuleRowBadges({ module }: { module: ModuleMeta }) {
  return (
    <>
      {module.brazilian ? (
        <span className="text-[9px] font-bold px-1 bg-success/20 text-success">
          BR
        </span>
      ) : null}
      {module.comingSoon ? (
        <span className="text-[9px] font-bold px-1 bg-muted text-muted-foreground">
          Em breve
        </span>
      ) : null}
    </>
  );
}

function ModuleRowCheckbox({ active }: { active: boolean }) {
  return (
    <div
      className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
        active ? "bg-brand border-brand" : "border-border-strong"
      }`}
    >
      {active ? <Check className="w-3 h-3 text-brand-foreground" /> : null}
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function ModuleRow({
  module,
  config,
  onToggleModule,
}: {
  module: ModuleMeta;
  config: ProjectConfig;
  onToggleModule: (id: ModuleId) => void;
}) {
  const active = config.modules.includes(module.id);
  const reason = getModuleDisableReason(config, module.id);
  const needsAdjust = !active && reason !== null;

  return (
    <button
      type="button"
      onClick={() => {
        onToggleModule(module.id);
      }}
      title={needsAdjust ? reason : module.tagline}
      aria-pressed={active}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
        active
          ? "bg-brand-subtle"
          : needsAdjust
            ? "bg-warning/5"
            : "hover:bg-secondary"
      }`}
    >
      <BrandLogo id={module.id} label={module.name} height={22} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{module.name}</span>
          <ModuleRowBadges module={module} />
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {module.tagline}
        </div>
      </div>
      <ModuleRowCheckbox active={active} />
    </button>
  );
}

function ModuleCategoryList({
  cat,
  items,
  config,
  onToggleModule,
}: {
  cat: (typeof MODULE_CATEGORIES)[number];
  items: ModuleMeta[];
  config: ProjectConfig;
  onToggleModule: (id: ModuleId) => void;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        {MODULE_CATEGORY_LABELS[cat]}
      </div>
      <ul className="border border-border divide-y divide-border">
        {items.map((module) => (
          <li key={module.id}>
            <ModuleRow
              module={module}
              config={config}
              onToggleModule={onToggleModule}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function ModuleListSection({
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
    items: mods.filter((module) => module.category === cat),
  })).filter((group) => group.items.length > 0);

  if (mods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        {hint ? (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        ) : null}
      </div>
      {byCategory.map(({ cat, items }) => (
        <ModuleCategoryList
          key={cat}
          cat={cat}
          items={items}
          config={config}
          onToggleModule={onToggleModule}
        />
      ))}
    </div>
  );
}

function ModuleSearchBar({
  moduleSearch,
  moduleFilter,
  onModuleSearchChange,
  onModuleFilterChange,
}: {
  moduleSearch: string;
  moduleFilter: string;
  onModuleSearchChange: (v: string) => void;
  onModuleFilterChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="search"
          value={moduleSearch}
          onChange={(event) => {
            onModuleSearchChange(event.target.value);
          }}
          placeholder="Buscar módulo…"
          aria-label="Buscar módulo"
          className="w-full h-9 pl-8 pr-3 bg-background border border-input text-sm focus:outline-none focus:border-brand"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {MODULE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => {
              onModuleFilterChange(filter.id);
            }}
            className={`text-[11px] px-2 py-1 border transition-colors ${
              moduleFilter === filter.id
                ? "border-brand bg-brand-subtle text-brand"
                : "border-border hover:bg-secondary"
            }`}
            aria-pressed={moduleFilter === filter.id}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepBrazilIntro({
  moduleCount,
  preset,
}: {
  moduleCount: number;
  preset: ProjectConfig["preset"];
}) {
  return (
    <>
      <SectionTitle hint="Integrações BR (PIX, LGPD, CEP…) e globais (Claude, Sentry, email…).">
        Módulos & integrações
      </SectionTitle>
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        <span className="text-brand font-medium tabular-nums">
          {moduleCount}
        </span>{" "}
        ativos
        {preset === "veloz-br"
          ? " · preset Veloz BR já inclui o essencial"
          : ""}
      </p>
    </>
  );
}

function StepBrazilLists({
  config,
  modules,
  onToggleModule,
}: {
  config: ProjectConfig;
  modules: ModuleMeta[];
  onToggleModule: (id: ModuleId) => void;
}) {
  const brazilMods = modules.filter((module) => isBrazilModule(module.id));
  const globalMods = modules.filter((module) => !isBrazilModule(module.id));

  return (
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
  );
}

/** @internal Scaffold pipeline step. */
export function StepBrazil({
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
  return (
    <>
      <StepBrazilIntro
        moduleCount={config.modules.length}
        preset={config.preset}
      />
      <ModuleSearchBar
        moduleSearch={moduleSearch}
        moduleFilter={moduleFilter}
        onModuleSearchChange={onModuleSearchChange}
        onModuleFilterChange={onModuleFilterChange}
      />
      <StepBrazilLists
        config={config}
        modules={modules}
        onToggleModule={onToggleModule}
      />
    </>
  );
}
