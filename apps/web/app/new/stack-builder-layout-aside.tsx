"use client";

import type { ProjectConfig } from "@/lib/veloz-stack-types";

import { PreviewPanel } from "./preview-panel";
import { SummaryPanel } from "./stack-builder-step-review";
import type { StackBuilderState } from "./stack-builder-state";

export function StackBuilderLayoutAside({
  config,
  builder,
}: {
  config: ProjectConfig;
  builder: StackBuilderState;
}) {
  return (
    <aside className="hidden lg:flex flex-col border-l border-border bg-secondary/20 lg:sticky lg:top-11 lg:self-start lg:h-[calc(100vh-44px)]">
      <SummaryPanel config={config} onJump={builder.handleGoToStepForKey} />
      <div className="flex-1 min-h-0 border-t border-border">
        <PreviewPanel config={config} />
      </div>
    </aside>
  );
}
