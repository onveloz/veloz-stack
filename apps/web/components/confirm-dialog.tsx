"use client";

import { ArrowRight, Triangle, X } from "lucide-react";
import { useEffect } from "react";
import type { ConfigChange } from "@/lib/resolve-config";
import { formatKey } from "@/lib/resolve-config";

export function ConfirmCascadeDialog({
  open,
  title,
  primaryReason,
  changes,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  primaryReason: string;
  changes: ConfigChange[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  // First entry is the primary request; everything after is cascade
  const cascade = changes.slice(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-4 bg-background border border-border-strong shadow-2xl"
      >
        <div className="flex items-start justify-between p-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-warning/15 flex items-center justify-center shrink-0">
              <Triangle className="w-4 h-4 text-warning" fill="currentColor" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold leading-tight">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{primaryReason}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-1 -m-1"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {cascade.length > 0 ? (
          <div className="p-4 border-b border-border">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Pra isso funcionar, o Veloz Stack vai ajustar também
            </div>
            <ul className="space-y-1.5">
              {cascade.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono flex-wrap">
                    <span className="text-muted-foreground">{formatKey(c.key)}:</span>
                    <span className="text-foreground line-through decoration-destructive/50">
                      {c.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-brand font-semibold">
                      {c.to === null ? "removido" : c.to}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 border-b border-border text-xs text-muted-foreground">
            Nenhum outro ajuste necessário.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 p-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 text-xs font-medium text-foreground hover:bg-secondary border border-border-strong"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="h-8 px-3 text-xs font-medium bg-brand text-brand-foreground hover:bg-brand-hover active:scale-[0.97] transition-[colors,transform] border border-brand"
          >
            Aplicar ajustes
          </button>
        </div>
      </div>
    </div>
  );
}
