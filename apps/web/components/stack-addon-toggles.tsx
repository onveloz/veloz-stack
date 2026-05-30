"use client";

import type { ProjectConfig } from "@/lib/veloz-stack-types";

import { ADDON_META } from "@/app/new/stack-builder-labels";
import { BrandLogo } from "@/components/brand-logo";
import { ToggleOptionRow } from "@/components/toggle-option-row";

function TurborepoToggleIndicator({ active }: { active: boolean }) {
  return (
    <div
      className={`w-4 h-4 border shrink-0 flex items-center justify-center ${
        active ? "bg-brand border-brand" : "border-border-strong"
      }`}
    >
      {active ? <span className="block w-2 h-2 bg-brand-foreground" /> : null}
    </div>
  );
}

/** Turborepo addon toggle on the stack builder tools step. */
export function TurborepoToggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="border border-border p-3 bg-secondary/40">
      <label
        className={`w-full flex items-center gap-3 text-left cursor-pointer ${
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <input
          type="checkbox"
          checked={active}
          onChange={() => {
            onChange(!active);
          }}
          className="sr-only"
          aria-label={ADDON_META.turborepo.label}
        />
        <BrandLogo
          id="turborepo"
          label={ADDON_META.turborepo.label}
          height={22}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {ADDON_META.turborepo.label}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {ADDON_META.turborepo.tagline}
          </div>
        </div>
        <TurborepoToggleIndicator active={active} />
      </label>
    </div>
  );
}

/** Lefthook CI / advanced hook options when the Lefthook addon is enabled. */
export function LefthookOptions({
  config,
  onLefthookCiChange,
  onLefthookAdvancedChange,
}: {
  config: ProjectConfig;
  onLefthookCiChange: () => void;
  onLefthookAdvancedChange: () => void;
}) {
  return (
    <div className="border border-border p-3 space-y-1 bg-secondary/40">
      <p className="text-[11px] text-muted-foreground px-0.5">
        Nível Lefthook (opcional)
      </p>
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
  );
}
