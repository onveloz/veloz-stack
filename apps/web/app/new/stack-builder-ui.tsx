"use client";

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { BuilderMode, STEPS, StepId } from "./stack-builder-constants";

/** @internal Scaffold pipeline step. */
export function ModeToggle({
  mode,
  onChange,
}: {
  mode: BuilderMode;
  onChange: (m: BuilderMode) => void;
}) {
  return (
    <div className="inline-flex border border-border-strong text-[11px]">
      <button
        type="button"
        onClick={() => {
          onChange("quick");
        }}
        aria-pressed={mode === "quick"}
        className={`px-2.5 py-1.5 transition-colors ${
          mode === "quick"
            ? "bg-brand text-brand-foreground"
            : "hover:bg-secondary"
        }`}
      >
        Rápido
      </button>
      <button
        type="button"
        onClick={() => {
          onChange("full");
        }}
        aria-pressed={mode === "full"}
        className={`px-2.5 py-1.5 border-l border-border-strong transition-colors ${
          mode === "full"
            ? "bg-brand text-brand-foreground"
            : "hover:bg-secondary"
        }`}
      >
        Completo
      </button>
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function StepFooter({
  visibleSteps,
  step,
  onStep,
}: {
  visibleSteps: typeof STEPS;
  step: StepId;
  onStep: (s: StepId) => void;
}) {
  const idx = visibleSteps.findIndex((s) => s.id === step);
  if (idx === -1) {
    return null;
  }
  const prev = visibleSteps[idx - 1];
  const next = visibleSteps[idx + 1];
  if (!prev && !next) {
    return null;
  }
  return (
    <div className="mt-10 flex justify-between gap-3">
      {prev ? (
        <button
          type="button"
          onClick={() => {
            onStep(prev.id);
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← {prev.label}
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button
          type="button"
          onClick={() => {
            onStep(next.id);
          }}
          className="text-xs font-medium text-brand hover:underline inline-flex items-center gap-1"
        >
          {next.label} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-heading text-xl font-semibold" data-heading>
        {children}
      </h2>
      {hint ? (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function SubLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
      {children}
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function ChipRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5">
      <SubLabel>{label}</SubLabel>
      {hint ? (
        <p className="text-[11px] text-muted-foreground mb-2 -mt-1">{hint}</p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
