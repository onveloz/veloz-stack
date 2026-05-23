"use client";

import type { ProjectConfig } from "@/lib/veloz-stack-types";
import type { useStackConfig } from "@/lib/use-stack-config";

import { StackBuilderStepContent } from "./stack-builder-step-content";
import {
  StackBuilderMobileTabs,
  StackBuilderSidebar,
} from "./stack-builder-sidebar-nav";
import { StackBuilderLayoutAside } from "./stack-builder-layout-aside";
import type { StackBuilderState } from "./stack-builder-state";
import { StepFooter } from "./stack-builder-ui";

export function StackBuilderLayoutGrid({
  builder,
  config,
  setState,
}: {
  builder: StackBuilderState;
  config: ProjectConfig;
  setState: ReturnType<typeof useStackConfig>["setState"];
}) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[200px_minmax(0,1fr)_300px] min-h-0">
      <StackBuilderSidebar
        visibleSteps={builder.visibleSteps}
        step={builder.step}
        progress={builder.progress}
        mode={builder.mode}
        onStep={builder.handleStepChange}
        onShowFullMode={builder.handleShowFullMode}
      />

      <main className="min-w-0 flex flex-col">
        <StackBuilderMobileTabs
          visibleSteps={builder.visibleSteps}
          step={builder.step}
          onStep={builder.handleStepChange}
        />

        <div className="flex-1 px-4 sm:px-6 py-6 pb-36 max-w-3xl">
          <StackBuilderStepContent
            builder={builder}
            config={config}
            setState={setState}
          />
          <StepFooter
            visibleSteps={builder.visibleSteps}
            step={builder.step}
            onStep={builder.handleStepChange}
          />
        </div>
      </main>

      <StackBuilderLayoutAside config={config} builder={builder} />
    </div>
  );
}
