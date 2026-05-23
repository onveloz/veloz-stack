"use client";

import type { STEPS, StepId } from "./stack-builder-constants";

function SidebarStepButton({
  index,
  stepItem,
  active,
  onStep,
}: {
  index: number;
  stepItem: (typeof STEPS)[number];
  active: boolean;
  onStep: (step: StepId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onStep(stepItem.id);
      }}
      className={`w-full text-left px-3 py-2 border transition-colors ${
        active
          ? "border-brand bg-brand-subtle text-brand"
          : "border-transparent hover:bg-secondary text-foreground"
      }`}
      aria-current={active ? "step" : undefined}
    >
      <span className="text-[10px] text-muted-foreground font-mono mr-2">
        {index + 1}
      </span>
      <span className="text-sm font-medium">{stepItem.label}</span>
      <div className="text-[10px] text-muted-foreground mt-0.5 pl-5">
        {stepItem.short}
      </div>
    </button>
  );
}

export function StackBuilderSidebar({
  visibleSteps,
  step,
  progress,
  mode,
  onStep,
  onShowFullMode,
}: {
  visibleSteps: typeof STEPS;
  step: StepId;
  progress: number;
  mode: "quick" | "full";
  onStep: (step: StepId) => void;
  onShowFullMode: () => void;
}) {
  return (
    <nav className="hidden xl:block border-r border-border bg-secondary/20 p-4 sticky top-11 self-start h-[calc(100vh-44px)] overflow-y-auto">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
        Passos · {progress}%
      </div>
      <ol className="space-y-1">
        {visibleSteps.map((stepItem, index) => (
          <li key={stepItem.id}>
            <SidebarStepButton
              index={index}
              stepItem={stepItem}
              active={step === stepItem.id}
              onStep={onStep}
            />
          </li>
        ))}
      </ol>
      {mode === "quick" ? (
        <button
          type="button"
          onClick={onShowFullMode}
          className="mt-4 w-full text-xs text-brand hover:underline text-left px-1"
        >
          Mostrar passos avançados →
        </button>
      ) : null}
    </nav>
  );
}

export function StackBuilderMobileTabs({
  visibleSteps,
  step,
  onStep,
}: {
  visibleSteps: typeof STEPS;
  step: StepId;
  onStep: (step: StepId) => void;
}) {
  return (
    <div className="xl:hidden border-b border-border flex overflow-x-auto bg-secondary/30">
      {visibleSteps.map((stepItem) => (
        <button
          key={stepItem.id}
          type="button"
          onClick={() => {
            onStep(stepItem.id);
          }}
          className={`shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            step === stepItem.id
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground"
          }`}
          aria-current={step === stepItem.id ? "step" : undefined}
        >
          {stepItem.label}
        </button>
      ))}
    </div>
  );
}
