"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** Copies `value` to the clipboard and shows a brief success state. */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1500);
      }}
      className={`inline-flex items-center gap-1.5 text-xs font-medium h-8 px-3 border border-border-strong bg-secondary hover:bg-border-strong hover:border-brand/50 text-foreground active:scale-[0.97] transition-[colors,transform] ${
        className ?? ""
      }`}
      aria-label={
        label ? `Copiar: ${label}` : "Copiar para a área de transferência"
      }
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-success" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      <span>{copied ? "Copiado" : (label ?? "Copiar")}</span>
    </button>
  );
}
