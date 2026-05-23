"use client";

import { PRESETS } from "@veloz-stack/types";

import type {
  PresetId,
  PresetKey,
  ProjectConfig,
} from "@/lib/veloz-stack-types";

import { ModeToggle } from "./stack-builder-ui";

function ProjectNameField({
  projectName,
  onProjectNameChange,
}: {
  projectName: string;
  onProjectNameChange: (name: string) => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <label
        htmlFor="project-name"
        className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5"
      >
        Nome do projeto
      </label>
      <input
        id="project-name"
        type="text"
        value={projectName}
        aria-label="Nome do projeto"
        onChange={(event) => {
          onProjectNameChange(event.target.value);
        }}
        className="w-full max-w-xs bg-background border border-input h-9 px-3 text-sm font-mono focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
      />
    </div>
  );
}

function ProjectToggles({
  install,
  git,
  onInstallChange,
  onGitChange,
}: {
  install: boolean;
  git: boolean;
  onInstallChange: (install: boolean) => void;
  onGitChange: (git: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={install}
          aria-label="Instalar dependências"
          onChange={(event) => {
            onInstallChange(event.target.checked);
          }}
          className="accent-brand"
        />
        deps
      </label>
      <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={git}
          aria-label="Inicializar git"
          onChange={(event) => {
            onGitChange(event.target.checked);
          }}
          className="accent-brand"
        />
        git
      </label>
    </div>
  );
}

function presetButtonClassName(
  comingSoon: boolean,
  isActive: boolean,
  isBase: boolean,
): string {
  if (comingSoon) {
    return "opacity-50 cursor-not-allowed border-border";
  }
  if (isActive) {
    return "border-brand bg-brand-subtle";
  }
  if (isBase) {
    return "border-brand/50 bg-brand/5";
  }
  return "border-border hover:border-border-strong hover:bg-secondary";
}

function PresetComingSoonHint({ id }: { id: string }) {
  return (
    <span id={`${id}-coming-soon`} className="sr-only">
      Em breve
    </span>
  );
}

function PresetButton({
  id,
  preset,
  isActive,
  isBase,
  comingSoon,
  onApplyPreset,
  isPresetKey,
}: {
  id: string;
  preset: (typeof PRESETS)[PresetKey];
  isActive: boolean;
  isBase: boolean;
  comingSoon: boolean;
  onApplyPreset: (id: PresetKey) => void;
  isPresetKey: (id: string) => id is PresetKey;
}) {
  return (
    <button
      type="button"
      aria-disabled={comingSoon || undefined}
      aria-describedby={comingSoon ? `${id}-coming-soon` : undefined}
      onClick={() => {
        if (comingSoon) {
          return;
        }
        if (isPresetKey(id)) {
          onApplyPreset(id);
        }
      }}
      title={comingSoon ? "Em breve" : undefined}
      className={`shrink-0 text-left px-3 py-2 border min-w-[140px] max-w-[200px] transition-colors ${presetButtonClassName(comingSoon, isActive, isBase)}`}
    >
      <div className="font-medium text-sm text-foreground">{preset.label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
        {preset.description}
      </div>
      {comingSoon ? <PresetComingSoonHint id={id} /> : null}
    </button>
  );
}

export function StackBuilderPresetFields({
  config,
  mode,
  onModeChange,
  onProjectNameChange,
  onInstallChange,
  onGitChange,
}: {
  config: ProjectConfig;
  mode: "quick" | "full";
  onModeChange: (mode: "quick" | "full") => void;
  onProjectNameChange: (name: string) => void;
  onInstallChange: (install: boolean) => void;
  onGitChange: (git: boolean) => void;
}) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end gap-4">
      <ProjectNameField
        projectName={config.projectName}
        onProjectNameChange={onProjectNameChange}
      />
      <div className="flex items-center gap-2 shrink-0">
        <ModeToggle mode={mode} onChange={onModeChange} />
        <ProjectToggles
          install={config.install}
          git={config.git}
          onInstallChange={onInstallChange}
          onGitChange={onGitChange}
        />
      </div>
    </div>
  );
}

export function StackBuilderPresetButtons({
  config,
  basePreset,
  onApplyPreset,
  isComingSoonPreset,
  isPresetKey,
}: {
  config: ProjectConfig;
  basePreset: PresetId;
  onApplyPreset: (id: PresetKey) => void;
  isComingSoonPreset: (id: string) => boolean;
  isPresetKey: (id: string) => id is PresetKey;
}) {
  return (
    <div className="max-w-6xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-1">
      {Object.entries(PRESETS).map(([id, preset]) => (
        <PresetButton
          key={id}
          id={id}
          preset={preset}
          isActive={config.preset === id}
          isBase={
            config.preset === "custom" && basePreset === id && id !== "custom"
          }
          comingSoon={isComingSoonPreset(id)}
          onApplyPreset={onApplyPreset}
          isPresetKey={isPresetKey}
        />
      ))}
    </div>
  );
}
