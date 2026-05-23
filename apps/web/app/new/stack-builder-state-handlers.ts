import { MODULES, PRESETS } from "@veloz-stack/types";
import {
  isStackKey,
  resolveStackChange,
} from "@veloz-stack/types/resolve-stack";

import { buildSurpriseConfig } from "@/lib/randomize-stack";
import { repairStackConfig, resolveEnableModule } from "@/lib/resolve-config";
import {
  addonFlagsAfterGitHook,
  addonFlagsAfterLinter,
  patchAddonsForGitHook,
  patchAddonsForLinter,
  patchAddonsTurborepo,
} from "@/lib/stack-addons";
import type { GitHookChoice, LinterChoice } from "@/lib/stack-addons-types";
import type {
  ConfigChange,
  ModuleId,
  PresetKey,
  ProjectConfig,
} from "@/lib/veloz-stack-types";
import type { useStackConfig } from "@/lib/use-stack-config";

import type { BuilderMode, StepId } from "./stack-builder-app-types";
import type { PendingChange } from "./stack-builder-state-core";

type SetState = ReturnType<typeof useStackConfig>["setState"];

export interface HandlerContext {
  config: ProjectConfig;
  mode: BuilderMode;
  setState: SetState;
  setStep: (step: StepId) => void;
  setMode: (mode: BuilderMode) => void;
  setPending: (pending: PendingChange | null) => void;
  setShareCopied: (copied: boolean) => void;
}

export function createShareHandler(
  ctx: Pick<HandlerContext, "setShareCopied">,
) {
  return async function handleShare() {
    try {
      await navigator.clipboard.writeText(globalThis.location.href);
      ctx.setShareCopied(true);
      setTimeout(() => {
        ctx.setShareCopied(false);
      }, 1500);
    } catch {
      ctx.setShareCopied(false);
    }
  };
}

export function createApplyPresetHandler(
  ctx: Pick<HandlerContext, "config" | "mode" | "setState" | "setStep">,
) {
  return function handleApplyPreset(id: PresetKey) {
    const presetConfig = PRESETS[id].config;
    const repaired = repairStackConfig({ ...presetConfig });
    void ctx.setState({
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
    if (ctx.mode === "quick") {
      ctx.setStep("brazil");
    }
  };
}

export function createRandomizeHandler(
  ctx: Pick<HandlerContext, "config" | "setState" | "setStep">,
) {
  return function handleRandomize() {
    const next = buildSurpriseConfig({
      projectName: ctx.config.projectName,
      git: ctx.config.git,
      install: ctx.config.install,
    });
    void ctx.setState({ ...next, basePreset: "custom" });
    ctx.setStep("review");
  };
}

export function createToggleModuleHandler(
  ctx: Pick<HandlerContext, "config" | "setState" | "setPending">,
) {
  return function handleToggleModule(id: ModuleId) {
    const has = ctx.config.modules.includes(id);
    if (has) {
      void ctx.setState({
        modules: ctx.config.modules.filter((moduleId) => moduleId !== id),
        preset: "custom",
      });
      return;
    }
    const { newCfg, changes } = resolveEnableModule(ctx.config, id);
    if (changes.length === 0) {
      void ctx.setState({ modules: newCfg.modules, preset: "custom" });
      return;
    }
    ctx.setPending({
      title: `Ativar ${MODULES[id].name}?`,
      primaryReason: changes.at(-1)?.reason ?? "Ajustes necessários no stack.",
      changes,
      apply: () => {
        void ctx.setState({
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
        ctx.setPending(null);
      },
    });
  };
}

export function createGitHookHandler(
  ctx: Pick<HandlerContext, "config" | "setState">,
) {
  return function handleGitHookChange(choice: GitHookChoice) {
    void ctx.setState({
      addons: patchAddonsForGitHook(ctx.config.addons, choice),
      preset: "custom",
      ...addonFlagsAfterGitHook(choice),
    });
  };
}

export function createLinterHandler(
  ctx: Pick<HandlerContext, "config" | "setState">,
) {
  return function handleLinterChange(choice: LinterChoice) {
    void ctx.setState({
      addons: patchAddonsForLinter(ctx.config.addons, choice),
      preset: "custom",
      ...addonFlagsAfterLinter(choice),
    });
  };
}

export function createTurborepoHandler(
  ctx: Pick<HandlerContext, "config" | "setState">,
) {
  return function handleTurborepoChange(on: boolean) {
    void ctx.setState({
      addons: patchAddonsTurborepo(ctx.config.addons, on),
      preset: "custom",
    });
  };
}

export function createToggleExampleHandler(
  ctx: Pick<HandlerContext, "config" | "setState">,
) {
  return function handleToggleExample(id: ProjectConfig["examples"][number]) {
    if (id === "none") {
      return;
    }
    const has = ctx.config.examples.includes(id);
    void ctx.setState({
      examples: has
        ? ctx.config.examples.filter((exampleId) => exampleId !== id)
        : [...ctx.config.examples, id],
      preset: "custom",
    });
  };
}

export function createRequestChangeHandler(
  ctx: Pick<HandlerContext, "config" | "setState" | "setPending">,
) {
  return function requestChange(
    key: keyof ProjectConfig,
    value: string,
    labelForTitle?: string,
  ) {
    applyStackRequestChange(ctx, { key, value, labelForTitle });
  };
}

function applyResolvedStackChange(
  ctx: Pick<HandlerContext, "setState" | "setPending">,
  newCfg: ProjectConfig,
  meta: { title: string; primaryReason: string; changes: ConfigChange[] },
) {
  ctx.setPending({
    title: meta.title,
    primaryReason: meta.primaryReason,
    changes: meta.changes,
    apply: () => {
      void ctx.setState({
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
      ctx.setPending(null);
    },
  });
}

function applyStackRequestChange(
  ctx: Pick<HandlerContext, "config" | "setState" | "setPending">,
  change: {
    key: keyof ProjectConfig;
    value: string;
    labelForTitle?: string;
  },
) {
  const { key, value, labelForTitle } = change;
  const current = (ctx.config as Record<string, unknown>)[key];
  if (current === value) {
    return;
  }
  if (!isStackKey(key)) {
    void ctx.setState({ [key]: value, preset: "custom" } as Parameters<
      typeof ctx.setState
    >[0]);
    return;
  }
  const { newCfg, changes } = resolveStackChange(ctx.config, { key, value });
  if (changes.length <= 1) {
    void ctx.setState({ [key]: value, preset: "custom" } as Parameters<
      typeof ctx.setState
    >[0]);
    return;
  }
  applyResolvedStackChange(ctx, newCfg, {
    title: `Trocar para ${labelForTitle ?? value}?`,
    primaryReason:
      changes[0]?.reason ?? "Isso vai ajustar outras partes do stack.",
    changes,
  });
}

export function createGoToStepHandler(
  ctx: Pick<HandlerContext, "setStep" | "setMode">,
) {
  return function handleGoToStepForKey(key: string) {
    if (key === "modules") {
      ctx.setMode("full");
      ctx.setStep("brazil");
      return;
    }
    if (
      [
        "frontend",
        "mobile",
        "desktop",
        "backend",
        "runtime",
        "api",
        "ui",
      ].includes(key)
    ) {
      ctx.setStep("platform");
      return;
    }
    if (["db", "orm", "dbHosting", "auth", "deploy", "pm"].includes(key)) {
      ctx.setMode("full");
      ctx.setStep("data");
      return;
    }
    if (["addons", "examples"].includes(key)) {
      ctx.setMode("full");
      ctx.setStep("tools");
    }
  };
}
