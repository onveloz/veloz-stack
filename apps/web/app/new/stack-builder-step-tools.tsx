"use client";

import { ExampleId } from "@veloz-stack/types";
import { Sparkles } from "lucide-react";

import type { ProjectConfig } from "@/lib/veloz-stack-types";
import type { GitHookChoice, LinterChoice } from "@/lib/stack-addons-types";
import type { useStackConfig } from "@/lib/use-stack-config";

import { StackAddonPickers } from "@/components/stack-addon-pickers";

import { EXAMPLE_META } from "./stack-builder-labels";
import { SectionTitle, SubLabel } from "./stack-builder-ui";

type ExampleOption = Exclude<(typeof ExampleId.options)[number], "none">;

export function ExampleCard({
  id,
  active,
  onToggleExample,
}: {
  id: ExampleOption;
  active: boolean;
  onToggleExample: (id: ExampleOption) => void;
}) {
  const meta = EXAMPLE_META[id];
  const comingSoon = id === "ai-chat";

  return (
    <button
      type="button"
      disabled={comingSoon}
      onClick={() => {
        if (!comingSoon) {
          onToggleExample(id);
        }
      }}
      className={`text-left p-3 border flex gap-3 items-start ${
        comingSoon
          ? "opacity-50 cursor-not-allowed"
          : active
            ? "border-brand bg-brand-subtle"
            : "border-border hover:bg-secondary"
      }`}
    >
      <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-medium">{meta.label}</div>
        <div className="text-[11px] text-muted-foreground">{meta.tagline}</div>
      </div>
    </button>
  );
}

function ExampleGrid({
  config,
  onToggleExample,
}: {
  config: ProjectConfig;
  onToggleExample: (id: ExampleOption) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {ExampleId.options
        .filter((id): id is ExampleOption => id !== "none")
        .map((id) => (
          <ExampleCard
            key={id}
            id={id}
            active={config.examples.includes(id)}
            onToggleExample={onToggleExample}
          />
        ))}
    </div>
  );
}

function StepToolsAddons({
  config,
  onGitHookChange,
  onLinterChange,
  onTurborepoChange,
  setState,
}: {
  config: ProjectConfig;
  onGitHookChange: (choice: GitHookChoice) => void;
  onLinterChange: (choice: LinterChoice) => void;
  onTurborepoChange: (on: boolean) => void;
  setState: ReturnType<typeof useStackConfig>["setState"];
}) {
  return (
    <>
      <SubLabel>Ferramentas DX</SubLabel>
      <div className="mb-6">
        <StackAddonPickers
          config={config}
          onGitHookChange={onGitHookChange}
          onLinterChange={onLinterChange}
          onTurborepoChange={onTurborepoChange}
          onOxlintStrictChange={() => {
            void setState({
              oxlintStrict: !config.oxlintStrict,
              preset: "custom",
            });
          }}
          onLefthookCiChange={() => {
            void setState({
              lefthookCi: !config.lefthookCi,
              lefthookAdvanced: false,
              preset: "custom",
            });
          }}
          onLefthookAdvancedChange={() => {
            void setState({
              lefthookAdvanced: !config.lefthookAdvanced,
              lefthookCi: false,
              preset: "custom",
            });
          }}
        />
      </div>
    </>
  );
}

export function StepTools({
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
  onToggleExample: (id: ExampleOption) => void;
  setState: ReturnType<typeof useStackConfig>["setState"];
}) {
  return (
    <>
      <SectionTitle hint="Lint, monorepo, hooks e starters opcionais.">
        Ferramentas & exemplos
      </SectionTitle>
      <StepToolsAddons
        config={config}
        onGitHookChange={onGitHookChange}
        onLinterChange={onLinterChange}
        onTurborepoChange={onTurborepoChange}
        setState={setState}
      />
      <SubLabel>Exemplos prontos</SubLabel>
      <ExampleGrid config={config} onToggleExample={onToggleExample} />
    </>
  );
}
