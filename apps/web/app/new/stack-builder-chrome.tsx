"use client";

import { ArrowLeft, Check, Share2, Shuffle } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { Logo } from "@/components/logo";

export function StackBuilderHeader({
  shareCopied,
  onShare,
  onRandomize,
}: {
  shareCopied: boolean;
  onShare: () => void;
  onRandomize: () => void;
}) {
  return (
    <header className="h-11 border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 bg-background z-40">
      <div className="flex items-center gap-4">
        <Logo />
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Home
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRandomize}
          className="inline-flex items-center gap-1.5 text-xs h-8 px-3 border border-border-strong bg-secondary hover:bg-border-strong"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Surpreender</span>
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-1.5 text-xs h-8 px-3 border border-border-strong bg-secondary hover:bg-border-strong"
        >
          {shareCopied ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Share2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {shareCopied ? "Copiado" : "Compartilhar"}
          </span>
        </button>
      </div>
    </header>
  );
}

export function StackBuilderCommandBar({
  command,
  visible,
}: {
  command: string;
  visible: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:right-[300px] xl:right-[300px] border-t border-border bg-background/95 backdrop-blur z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="px-4 sm:px-6 py-2.5 flex items-center gap-3 min-w-0">
        <code className="flex-1 min-w-0 font-mono text-[10px] sm:text-xs text-muted-foreground truncate">
          <span className="text-brand">$</span> {command}
        </code>
        <CopyButton value={command} label="Copiar" className="shrink-0" />
      </div>
    </div>
  );
}
