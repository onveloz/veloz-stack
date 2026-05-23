"use client";

import type { KeyboardEvent } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { ChoiceIndicator } from "@/components/exclusive-choice-indicator";

/** Single selectable row inside {@link ExclusiveChoiceGroup}. */
export function ExclusiveChoiceItem<T extends string>({
  id,
  active,
  meta,
  logoId,
  title,
  onChange,
  onKeyDown,
}: {
  id: T;
  active: boolean;
  meta: { label: string; detail: string };
  logoId?: string;
  title: string;
  onChange: (v: T) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <li>
      <label
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${active ? "bg-brand-subtle" : "hover:bg-secondary"}`}
      >
        <input
          type="radio"
          name={title}
          checked={active}
          tabIndex={active ? 0 : -1}
          onChange={() => {
            onChange(id);
          }}
          onKeyDown={onKeyDown}
          className="sr-only"
          aria-label={meta.label}
        />
        {logoId ? (
          <BrandLogo id={logoId} label={meta.label} height={22} />
        ) : (
          <div className="w-[22px] shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{meta.label}</div>
          <div className="text-[11px] text-muted-foreground">{meta.detail}</div>
        </div>
        <ChoiceIndicator active={active} />
      </label>
    </li>
  );
}
