"use client";

import { Check } from "lucide-react";

/** Selectable row (checkbox replacement) — matches Lefthook / addon sub-options in the stack builder. */
export function ToggleOptionRow({
  label,
  detail,
  active,
  onClick,
}: {
  label: string;
  detail?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <label
      className={`w-full text-left flex items-start gap-3 min-h-[52px] px-2 py-2 transition-colors cursor-pointer ${
        active
          ? "border border-brand bg-brand-subtle/30"
          : "border border-transparent hover:bg-secondary/60"
      }`}
    >
      <input
        type="checkbox"
        checked={active}
        onChange={onClick}
        className="sr-only"
        aria-label={label}
      />
      <div
        className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 ${
          active ? "bg-brand border-brand" : "border-border-strong"
        }`}
      >
        {active ? <Check className="w-3 h-3 text-brand-foreground" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm">{label}</div>
        {detail ? (
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {detail}
          </div>
        ) : null}
      </div>
    </label>
  );
}
