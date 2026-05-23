"use client";

import {
  DbHostingId,
  DbId,
  getDbHostingDisableReason,
  getOrmDisableReason,
  OrmId,
} from "@veloz-stack/types";
import type { ProjectConfig } from "@/lib/veloz-stack-types";

import { OptionChip } from "./stack-builder-option-chip";
import { labelsDbHost, titleCase } from "./stack-builder-labels";
import type { RequestChange } from "./stack-builder-app-types";
import { ChipRow, SubLabel } from "./stack-builder-ui";

function OrmHostingRows({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <>
      <ChipRow label="ORM">
        {OrmId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={titleCase(id)}
            sectionKey="orm"
            active={config.orm === id}
            disabledReason={getOrmDisableReason(config, id)}
            onSelect={() => {
              requestChange("orm", id, titleCase(id));
            }}
          />
        ))}
      </ChipRow>
      <ChipRow label="Hospedagem">
        {DbHostingId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={labelsDbHost(id)}
            sectionKey="dbHosting"
            active={config.dbHosting === id}
            disabledReason={getDbHostingDisableReason(config, id)}
            brandHint={id === "veloz"}
            onSelect={() => {
              requestChange("dbHosting", id, labelsDbHost(id));
            }}
          />
        ))}
      </ChipRow>
    </>
  );
}

export function DatabaseSection({
  config,
  requestChange,
}: {
  config: ProjectConfig;
  requestChange: RequestChange;
}) {
  return (
    <div className="border border-border p-4 bg-secondary/30 mb-5">
      <SubLabel>Banco de dados</SubLabel>
      <ChipRow label="Engine">
        {DbId.options.map((id) => (
          <OptionChip
            key={id}
            id={id}
            label={titleCase(id)}
            sectionKey="db"
            active={config.db === id}
            disabledReason={null}
            onSelect={() => {
              requestChange("db", id, titleCase(id));
            }}
          />
        ))}
      </ChipRow>
      {config.db !== "none" ? (
        <OrmHostingRows config={config} requestChange={requestChange} />
      ) : null}
    </div>
  );
}
