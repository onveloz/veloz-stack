"use client";

import {
  AuthId,
  DeployId,
  getAuthDisableReason,
  getDeployDisableReason,
  PackageManagerId,
} from "@veloz-stack/types";

import type { ProjectConfig } from "@/lib/veloz-stack-types";

import { OptionChip } from "./stack-builder-option-chip";
import { labelsAuth, labelsDeploy, titleCase } from "./stack-builder-labels";
import type { RequestChange } from "./stack-builder-step-platform-sections";
import { ChipRow } from "./stack-builder-ui";

function AuthChipRow({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <ChipRow label="Autenticação">
      {AuthId.options.map((id) => (
        <OptionChip
          key={id}
          id={id}
          label={labelsAuth(id)}
          sectionKey="auth"
          active={config.auth === id}
          disabledReason={getAuthDisableReason(config, id)}
          onSelect={() => {
            requestChange("auth", id, labelsAuth(id));
          }}
        />
      ))}
    </ChipRow>
  );
}

function DeployChipRow({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <ChipRow
      label="Deploy"
      hint="Stack opinado Veloz: `npx onveloz deploy`, Dockerfile e health checks no repo."
    >
      {DeployId.options.map((id) => (
        <OptionChip
          key={id}
          id={id}
          label={labelsDeploy(id)}
          sectionKey="deploy"
          active={config.deploy === id}
          disabledReason={getDeployDisableReason(config, id)}
          brandHint={id === "veloz"}
          onSelect={() => {
            requestChange("deploy", id, labelsDeploy(id));
          }}
        />
      ))}
    </ChipRow>
  );
}

function PackageManagerChipRow({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <ChipRow label="Gerenciador de pacotes">
      {PackageManagerId.options.map((id) => (
        <OptionChip
          key={id}
          id={id}
          label={titleCase(id)}
          sectionKey="pm"
          active={config.pm === id}
          disabledReason={null}
          onSelect={() => {
            requestChange("pm", id, titleCase(id));
          }}
        />
      ))}
    </ChipRow>
  );
}

export function AuthDeployPmSection({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <>
      <AuthChipRow config={config} requestChange={requestChange} />
      <DeployChipRow config={config} requestChange={requestChange} />
      <PackageManagerChipRow config={config} requestChange={requestChange} />
    </>
  );
}
