"use client";

import {
  FrontendId,
  getFrontendDisableReason,
  getUiDisableReason,
  UiId,
} from "@veloz-stack/types";
import { ChevronDown } from "lucide-react";

import type { ProjectConfig } from "@/lib/veloz-stack-types";

import { OptionChip } from "./stack-builder-option-chip";
import { labelsFrontend, labelsUi } from "./stack-builder-labels";
import {
  ApiLayerSection,
  ExtraPlatformsSection,
} from "./stack-builder-step-platform-sections";
import type { RequestChange } from "./stack-builder-app-types";
import { ChipRow, SectionTitle } from "./stack-builder-ui";

function FrontendUiSection({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <>
      <ChipRow label="Frontend (web)">
        {FrontendId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={labelsFrontend(id)}
            sectionKey="frontend"
            active={config.frontend === id}
            disabledReason={getFrontendDisableReason(config, id)}
            onSelect={() => {
              requestChange("frontend", id, labelsFrontend(id));
            }}
          />
        ))}
      </ChipRow>
      <ChipRow label="UI">
        {UiId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={labelsUi(id)}
            sectionKey="ui"
            active={config.ui === id}
            disabledReason={getUiDisableReason(config, id)}
            onSelect={() => {
              requestChange("ui", id, labelsUi(id));
            }}
          />
        ))}
      </ChipRow>
    </>
  );
}

export function StepPlatform({
  config,
  extraPlatforms,
  onExtraPlatformsChange,
  requestChange,
}: {
  config: ProjectConfig;
  extraPlatforms: boolean;
  onExtraPlatformsChange: (v: boolean) => void;
  requestChange: RequestChange;
}) {
  const runtimeHint =
    config.frontend === "next" && config.backend === "next"
      ? "Com Route Handlers, Bun e Node são válidos. Workers exige Hono."
      : undefined;

  return (
    <>
      <SectionTitle hint="Escolha a base do app. O restante do stack se adapta.">
        Plataforma
      </SectionTitle>

      <FrontendUiSection config={config} requestChange={requestChange} />

      <ApiLayerSection
        config={config}
        requestChange={requestChange}
        runtimeHint={runtimeHint}
      />

      <button
        type="button"
        onClick={() => {
          onExtraPlatformsChange(!extraPlatforms);
        }}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${extraPlatforms ? "rotate-180" : ""}`}
        />
        Plataformas extras (mobile / desktop)
      </button>
      {extraPlatforms ? (
        <ExtraPlatformsSection config={config} requestChange={requestChange} />
      ) : null}
    </>
  );
}
