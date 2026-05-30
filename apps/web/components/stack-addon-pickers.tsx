"use client";

import type { ProjectConfig } from "@/lib/veloz-stack-types";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ADDON_META } from "@/app/new/stack-builder-labels";
import { ExclusiveChoiceGroup } from "@/components/exclusive-choice-group";
import {
  LefthookOptions,
  TurborepoToggle,
} from "@/components/stack-addon-toggles";
import { ToggleOptionRow } from "@/components/toggle-option-row";
import type { GitHookChoice, LinterChoice } from "@/lib/stack-addons-types";
import {
  GIT_HOOK_CHOICES,
  GIT_HOOK_CHOICES_DEFAULT_UI,
  getGitHookChoice,
  getLinterChoice,
  LINTER_CHOICES,
} from "@/lib/stack-addons";

const GIT_HOOK_LABELS: Record<
  GitHookChoice,
  { label: string; detail: string }
> = {
  none: { label: "Nenhum", detail: "Sem hooks Git no scaffold" },
  husky: {
    label: ADDON_META.husky.label,
    detail: ADDON_META.husky.tagline,
  },
  lefthook: {
    label: ADDON_META.lefthook.label,
    detail: ADDON_META.lefthook.tagline,
  },
};

const LINTER_LABELS: Record<LinterChoice, { label: string; detail: string }> = {
  none: { label: "Nenhum", detail: "Sem linter/formatador extra na raiz" },
  biome: {
    label: ADDON_META.biome.label,
    detail: ADDON_META.biome.tagline,
  },
  oxlint: {
    label: ADDON_META.oxlint.label,
    detail: ADDON_META.oxlint.tagline,
  },
};

function useShowLegacyHusky() {
  const searchParams = useSearchParams();
  return (
    searchParams.get("showLegacy") === "1" ||
    process.env.NEXT_PUBLIC_SHOW_LEGACY_HUSKY === "true"
  );
}

function useGitHookChoices(gitHook: GitHookChoice, showLegacyHusky: boolean) {
  return useMemo((): readonly GitHookChoice[] => {
    if (showLegacyHusky) {
      return GIT_HOOK_CHOICES;
    }
    if (gitHook === "husky") {
      return ["husky", ...GIT_HOOK_CHOICES_DEFAULT_UI];
    }
    return GIT_HOOK_CHOICES_DEFAULT_UI;
  }, [showLegacyHusky, gitHook]);
}

function LinterPicker({
  config,
  linter,
  onLinterChange,
  onOxlintStrictChange,
}: {
  config: ProjectConfig;
  linter: LinterChoice;
  onLinterChange: (choice: LinterChoice) => void;
  onOxlintStrictChange: () => void;
}) {
  return (
    <>
      <ExclusiveChoiceGroup
        title="Linter & formatador"
        hint="Escolha um — Biome e oxlint não podem coexistir no mesmo projeto."
        choices={LINTER_CHOICES}
        labels={LINTER_LABELS}
        value={linter}
        logos={{ biome: "biome", oxlint: "oxlint" }}
        onChange={onLinterChange}
      />
      {linter === "oxlint" ? (
        <ToggleOptionRow
          label="Modo strict"
          detail="Regras mais pesadas no .oxlintrc.json"
          active={config.oxlintStrict}
          onClick={onOxlintStrictChange}
        />
      ) : null}
    </>
  );
}

function GitHookPicker({
  config,
  gitHook,
  gitHookChoices,
  showLegacyHusky,
  onGitHookChange,
  onLefthookCiChange,
  onLefthookAdvancedChange,
}: {
  config: ProjectConfig;
  gitHook: GitHookChoice;
  gitHookChoices: readonly GitHookChoice[];
  showLegacyHusky: boolean;
  onGitHookChange: (choice: GitHookChoice) => void;
  onLefthookCiChange: () => void;
  onLefthookAdvancedChange: () => void;
}) {
  const gitHooksHint = showLegacyHusky
    ? "Escolha um — Husky e Lefthook são gerenciadores alternativos."
    : "Lefthook é a opção recomendada. Husky fica só com ?showLegacy=1 ou NEXT_PUBLIC_SHOW_LEGACY_HUSKY (legado).";

  return (
    <>
      <ExclusiveChoiceGroup
        title="Hooks Git"
        hint={gitHooksHint}
        choices={gitHookChoices}
        labels={GIT_HOOK_LABELS}
        value={gitHook}
        logos={{ husky: "husky", lefthook: "lefthook" }}
        onChange={onGitHookChange}
      />
      {gitHook === "lefthook" ? (
        <LefthookOptions
          config={config}
          onLefthookCiChange={onLefthookCiChange}
          onLefthookAdvancedChange={onLefthookAdvancedChange}
        />
      ) : null}
    </>
  );
}

/** Git-hook, linter, turborepo, and oxlint addon controls for the stack builder review step. */
export function StackAddonPickers({
  config,
  onGitHookChange,
  onLinterChange,
  onTurborepoChange,
  onOxlintStrictChange,
  onLefthookCiChange,
  onLefthookAdvancedChange,
}: {
  config: ProjectConfig;
  onGitHookChange: (choice: GitHookChoice) => void;
  onLinterChange: (choice: LinterChoice) => void;
  onTurborepoChange: (on: boolean) => void;
  onOxlintStrictChange: () => void;
  onLefthookCiChange: () => void;
  onLefthookAdvancedChange: () => void;
}) {
  const gitHook = getGitHookChoice(config.addons);
  const linter = getLinterChoice(config.addons);
  const turborepoOn = config.addons.includes("turborepo");
  const showLegacyHusky = useShowLegacyHusky();
  const gitHookChoices = useGitHookChoices(gitHook, showLegacyHusky);

  return (
    <div className="space-y-4">
      <LinterPicker
        config={config}
        linter={linter}
        onLinterChange={onLinterChange}
        onOxlintStrictChange={onOxlintStrictChange}
      />
      <GitHookPicker
        config={config}
        gitHook={gitHook}
        gitHookChoices={gitHookChoices}
        showLegacyHusky={showLegacyHusky}
        onGitHookChange={onGitHookChange}
        onLefthookCiChange={onLefthookCiChange}
        onLefthookAdvancedChange={onLefthookAdvancedChange}
      />
      <TurborepoToggle active={turborepoOn} onChange={onTurborepoChange} />
    </div>
  );
}
