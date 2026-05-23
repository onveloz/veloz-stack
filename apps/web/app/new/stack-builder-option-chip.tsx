"use client";

import { BrandLogo } from "@/components/brand-logo";
import { getHint } from "@/lib/option-hints";

function chipClassName(
  active: boolean,
  needsAdjust: boolean,
  brandHint: boolean,
): string {
  if (active) {
    return "inline-flex items-center gap-2 h-9 px-2.5 border text-left transition-colors max-w-full border-brand bg-brand-subtle";
  }
  if (needsAdjust) {
    return "inline-flex items-center gap-2 h-9 px-2.5 border text-left transition-colors max-w-full border-warning/40 bg-warning/5 opacity-50 cursor-not-allowed";
  }
  if (brandHint) {
    return "inline-flex items-center gap-2 h-9 px-2.5 border text-left transition-colors max-w-full border-brand/40 bg-brand/5";
  }
  return "inline-flex items-center gap-2 h-9 px-2.5 border text-left transition-colors max-w-full border-border hover:border-border-strong hover:bg-secondary";
}

function chipTitle(
  needsAdjust: boolean,
  disabledReason: string | null,
  hint: string | null | undefined,
): string | undefined {
  if (needsAdjust) {
    return disabledReason ?? undefined;
  }
  return hint ?? undefined;
}

export function OptionChip({
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
  const showBrandBadge = Boolean(brandHint && !active);

  return (
    <button
      type="button"
      disabled={needsAdjust}
      onClick={() => {
        if (needsAdjust) {
          return;
        }
        onSelect();
      }}
      title={chipTitle(needsAdjust, disabledReason, hint)}
      aria-pressed={active}
      className={chipClassName(active, needsAdjust, Boolean(brandHint))}
    >
      <BrandLogo id={id} label={label} height={20} />
      <span
        className={`text-xs font-medium truncate ${active ? "text-brand" : "text-foreground"}`}
      >
        {label}
      </span>
      {showBrandBadge ? (
        <span className="text-[8px] font-bold px-1 bg-brand/20 text-brand uppercase">
          ★
        </span>
      ) : null}
    </button>
  );
}
