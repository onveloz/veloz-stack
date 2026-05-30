"use client";

import type { ProjectConfig } from "@veloz-stack/types";
import { useSearchParams } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useMemo } from "react";
import { ADDON_META } from "@/app/new/stack-builder-labels";
import { BrandLogo } from "@/components/brand-logo";
import { ToggleOptionRow } from "@/components/toggle-option-row";
import {
  GIT_HOOK_CHOICES,
  GIT_HOOK_CHOICES_DEFAULT_UI,
  type GitHookChoice,
  getGitHookChoice,
  getLinterChoice,
  LINTER_CHOICES,
  type LinterChoice,
} from "@/lib/stack-addons";

const GIT_HOOK_LABELS: Record<GitHookChoice, { label: string; detail: string }> = {
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

function ExclusiveChoiceGroup<T extends string>({
  title,
  hint,
  choices,
  labels,
  value,
  logos,
  onChange,
}: {
  title: string;
  hint?: string;
  choices: readonly T[];
  labels: Record<T, { label: string; detail: string }>;
  value: T;
  logos?: Partial<Record<T, string>>;
  onChange: (v: T) => void;
}) {
  function move(delta: number) {
    const idx = choices.indexOf(value);
    const next = choices[(idx + delta + choices.length) % choices.length]!;
    onChange(next);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, _id: T) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
  }

  return (
    <div className="border border-border p-3 bg-secondary/40 space-y-2">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {hint ? <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p> : null}
      </div>
      <ul aria-label={title} className="border border-border divide-y divide-border bg-background">
        {choices.map((id) => {
          const active = value === id;
          const meta = labels[id];
          const logoId = logos?.[id];
          return (
            <li key={id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onChange(id)}
                onKeyDown={(e) => onKeyDown(e, id)}
                className={
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors " +
                  (active ? "bg-brand-subtle" : "hover:bg-secondary")
                }
              >
                {logoId ? (
                  <BrandLogo id={logoId} label={meta.label} height={22} />
                ) : (
                  <div className="w-[22px] shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{meta.label}</div>
                  <div className="text-[11px] text-muted-foreground">{meta.detail}</div>
                </div>
                <div
                  className={
                    "w-4 h-4 rounded-full border shrink-0 flex items-center justify-center " +
                    (active ? "border-brand bg-brand" : "border-border-strong")
                  }
                >
                  {active ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-foreground" />
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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
  const searchParams = useSearchParams();
  const showLegacyHusky =
    searchParams.get("showLegacy") === "1" || process.env.NEXT_PUBLIC_SHOW_LEGACY_HUSKY === "true";

  const gitHook = getGitHookChoice(config.addons);
  const linter = getLinterChoice(config.addons);
  const turborepoOn = config.addons.includes("turborepo");

  const gitHookChoices = useMemo((): readonly GitHookChoice[] => {
    if (showLegacyHusky) return GIT_HOOK_CHOICES;
    // Users with husky in URL/import config can still switch away cleanly.
    if (gitHook === "husky") return ["husky", ...GIT_HOOK_CHOICES_DEFAULT_UI];
    return GIT_HOOK_CHOICES_DEFAULT_UI;
  }, [showLegacyHusky, gitHook]);

  const gitHooksHint = showLegacyHusky
    ? "Escolha um — Husky e Lefthook são gerenciadores alternativos."
    : "Lefthook é a opção recomendada. Husky fica só com ?showLegacy=1 ou NEXT_PUBLIC_SHOW_LEGACY_HUSKY (legado).";

  return (
    <div className="space-y-4">
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
        <div className="border border-border p-3 space-y-1 bg-secondary/40">
          <p className="text-[11px] text-muted-foreground px-0.5">Nível Lefthook (opcional)</p>
          <ToggleOptionRow
            label="CI básico"
            detail="Pre-push + workflow mínimo"
            active={config.lefthookCi}
            onClick={onLefthookCiChange}
          />
          <ToggleOptionRow
            label="Avançado"
            detail="Biome staged, Conventional Commits, pipeline completo"
            active={config.lefthookAdvanced}
            onClick={onLefthookAdvancedChange}
          />
        </div>
      ) : null}

      <div className="border border-border p-3 bg-secondary/40">
        <button
          type="button"
          role="checkbox"
          aria-checked={turborepoOn}
          aria-label={ADDON_META.turborepo.label}
          onClick={() => onTurborepoChange(!turborepoOn)}
          className={
            "w-full flex items-center gap-3 text-left " +
            (turborepoOn ? "text-foreground" : "text-muted-foreground hover:text-foreground")
          }
        >
          <BrandLogo id="turborepo" label={ADDON_META.turborepo.label} height={22} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{ADDON_META.turborepo.label}</div>
            <div className="text-[11px] text-muted-foreground">{ADDON_META.turborepo.tagline}</div>
          </div>
          <div
            className={
              "w-4 h-4 border shrink-0 flex items-center justify-center " +
              (turborepoOn ? "bg-brand border-brand" : "border-border-strong")
            }
          >
            {turborepoOn ? <span className="block w-2 h-2 bg-brand-foreground" /> : null}
          </div>
        </button>
      </div>
    </div>
  );
}
