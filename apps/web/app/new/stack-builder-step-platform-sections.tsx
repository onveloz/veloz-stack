"use client";

import {
  ApiId,
  BackendId,
  DesktopId,
  MobileId,
  RuntimeId,
  getApiDisableReason,
  getBackendDisableReason,
  getRuntimeDisableReason,
} from "@veloz-stack/types";

import type { ProjectConfig } from "@/lib/veloz-stack-types";

import type { RequestChange } from "./stack-builder-app-types";
import { OptionChip } from "./stack-builder-option-chip";
import { labelsApi, labelsBackend, titleCase } from "./stack-builder-labels";
import { ChipRow, SubLabel } from "./stack-builder-ui";

function BackendChipRow({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <ChipRow label="Backend">
      {BackendId.options.map((id) => (
        <OptionChip
          key={id}
          id={id}
          label={labelsBackend(id)}
          sectionKey="backend"
          active={config.backend === id}
          disabledReason={getBackendDisableReason(config, id)}
          onSelect={() => {
            requestChange("backend", id, labelsBackend(id));
          }}
        />
      ))}
    </ChipRow>
  );
}

function RuntimeChipRow({
  config,
  requestChange,
  runtimeHint,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
  runtimeHint?: string;
}) {
  return (
    <ChipRow label="Runtime" hint={runtimeHint}>
      {RuntimeId.options.map((id) => (
        <OptionChip
          key={id}
          id={id}
          label={titleCase(id)}
          sectionKey="runtime"
          active={config.runtime === id}
          disabledReason={getRuntimeDisableReason(config, id)}
          onSelect={() => {
            requestChange("runtime", id, titleCase(id));
          }}
        />
      ))}
    </ChipRow>
  );
}

function ApiStyleChipRow({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <ChipRow label="Estilo de API">
      {ApiId.options.map((id) => (
        <OptionChip
          key={id}
          id={id}
          label={labelsApi(id)}
          sectionKey="api"
          active={config.api === id}
          disabledReason={getApiDisableReason(config, id)}
          onSelect={() => {
            requestChange("api", id, labelsApi(id));
          }}
        />
      ))}
    </ChipRow>
  );
}

export function ApiLayerSection({
  config,
  requestChange,
  runtimeHint,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
  runtimeHint?: string;
}) {
  return (
    <div className="border border-border p-4 bg-secondary/30 mb-5">
      <SubLabel>Camada API</SubLabel>
      <BackendChipRow config={config} requestChange={requestChange} />
      <RuntimeChipRow
        config={config}
        requestChange={requestChange}
        runtimeHint={runtimeHint}
      />
      <ApiStyleChipRow config={config} requestChange={requestChange} />
    </div>
  );
}

export function ExtraPlatformsSection({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <>
      <ChipRow label="Mobile">
        {MobileId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={id === "expo" ? "Expo" : "Nenhum"}
            sectionKey="mobile"
            active={config.mobile === id}
            disabledReason={null}
            onSelect={() => {
              requestChange("mobile", id);
            }}
          />
        ))}
      </ChipRow>
      <ChipRow label="Desktop">
        {DesktopId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={id === "tauri" ? "Tauri" : "Nenhum"}
            sectionKey="desktop"
            active={config.desktop === id}
            disabledReason={null}
            onSelect={() => {
              requestChange("desktop", id);
            }}
          />
        ))}
      </ChipRow>
    </>
  );
}
