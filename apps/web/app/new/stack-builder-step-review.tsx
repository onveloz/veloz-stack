"use client";

import type { ProjectConfig } from "@veloz-stack/types";

import { CopyButton } from "@/components/copy-button";

import { PreviewPanel } from "./preview-panel";
import { buildReviewRows } from "./stack-builder-review-rows";
import {
  labelsBackend,
  labelsDeploy,
  labelsFrontend,
  titleCase,
} from "./stack-builder-labels";
import { SectionTitle } from "./stack-builder-ui";

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-secondary text-sm"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground truncate">{value}</span>
    </button>
  );
}

function ReviewErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6">
      <div className="font-semibold mb-1">Combinação inválida</div>
      <ul className="list-disc list-inside text-xs space-y-0.5">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

function ReviewCommandBlock({ command }: { command: string }) {
  return (
    <div className="border border-brand/40 bg-brand/5 p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        Rode este comando
      </div>
      <code className="block font-mono text-xs sm:text-sm text-foreground break-all leading-relaxed mb-4">
        <span className="text-brand">$</span> {command}
      </code>
      <CopyButton
        value={command}
        label="Copiar e rodar"
        className="w-full sm:w-auto bg-brand text-brand-foreground border-brand hover:bg-brand-hover h-10 px-4 text-sm font-medium"
      />
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function StepReview({
  config,
  command,
  errors,
  onEdit,
}: {
  config: ProjectConfig;
  command: string;
  errors: string[];
  onEdit: (key: string) => void;
}) {
  const rows = buildReviewRows(config);

  return (
    <>
      <SectionTitle>Revisar e gerar</SectionTitle>
      <p className="text-sm text-muted-foreground mb-6">
        Confira o stack. Clique em um item para editar.
      </p>

      <ul className="border border-border divide-y divide-border mb-6">
        {rows.map((row) => (
          <li key={row.key}>
            <ReviewRow
              label={row.label}
              value={row.value}
              onEdit={() => {
                onEdit(row.key);
              }}
            />
          </li>
        ))}
      </ul>

      <ReviewErrors errors={errors} />
      <ReviewCommandBlock command={command} />

      <div className="lg:hidden mt-8 border border-border overflow-hidden">
        <PreviewPanel config={config} maxHeight={240} />
      </div>
    </>
  );
}

/** @internal Scaffold pipeline step. */
export function SummaryPanel({
  config,
  onJump,
}: {
  config: ProjectConfig;
  onJump: (key: string) => void;
}) {
  const chips: { key: string; value: string }[] = [
    { key: "frontend", value: labelsFrontend(config.frontend) },
    { key: "backend", value: labelsBackend(config.backend) },
    { key: "db", value: titleCase(config.db) },
    { key: "deploy", value: labelsDeploy(config.deploy) },
    { key: "modules", value: String(config.modules.length) },
  ];

  return (
    <div className="p-4 shrink-0">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        Stack ativo
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => {
              onJump(chip.key);
            }}
            className="text-[11px] font-mono px-2 py-1 border border-border hover:border-brand hover:bg-brand-subtle transition-colors"
          >
            <span className="text-muted-foreground">{chip.key}</span>{" "}
            <span className="text-foreground">{chip.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
