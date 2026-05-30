"use client";

import { ArrowRight } from "lucide-react";

import type { ConfigChange } from "@/lib/resolve-config";
import { formatConfigChangeKey } from "@veloz-stack/types/resolve-stack";

function cascadeChangeKey(change: ConfigChange): string {
  return `${change.key}:${change.from}:${change.to ?? "removed"}`;
}

/** Lists cascade side-effects shown in the stack-change confirm dialog (after the primary change). */
export function ConfirmCascadeList({ changes }: { changes: ConfigChange[] }) {
  const cascade = changes.slice(1);

  if (cascade.length === 0) {
    return (
      <div className="p-4 border-b border-border text-xs text-muted-foreground">
        Nenhum outro ajuste necessário.
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        Pra isso funcionar, o Veloz Stack vai ajustar também
      </div>
      <ul className="space-y-1.5">
        {cascade.map((change) => (
          <li
            key={cascadeChangeKey(change)}
            className="flex items-start gap-2 text-xs"
          >
            <div className="flex items-center gap-1.5 font-mono flex-wrap">
              <span className="text-muted-foreground">
                {formatConfigChangeKey(change.key)}:
              </span>
              <span className="text-foreground line-through decoration-destructive/50">
                {change.from}
              </span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-brand font-semibold">
                {change.to ?? "removido"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
