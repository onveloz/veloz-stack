"use client";

import type { ProjectConfig } from "@veloz-stack/types";

import { DatabaseSection } from "./stack-builder-step-data-db";
import { AuthDeployPmSection } from "./stack-builder-step-data-rest";
import type { RequestChange } from "./stack-builder-step-platform-sections";
import { SectionTitle } from "./stack-builder-ui";

export function StepData({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <>
      <SectionTitle hint="Persistência, auth e onde o app vai rodar.">
        Dados & deploy
      </SectionTitle>

      <DatabaseSection config={config} requestChange={requestChange} />
      <AuthDeployPmSection config={config} requestChange={requestChange} />
    </>
  );
}
