"use client";

import { Triangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { ConfigChange } from "@/lib/veloz-stack-types";

import { ConfirmCascadeList } from "./confirm-dialog-cascade-list";

function ConfirmDialogActions({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
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
        className="h-8 px-3 text-xs font-medium bg-brand text-brand-foreground hover:bg-brand-hover active:scale-[0.97] transition-[colors,transform] border border-brand"
      >
        Aplicar ajustes
      </button>
    </div>
  );
}

function ConfirmDialogHeader({
  title,
  primaryReason,
  onCancel,
}: {
  title: string;
  primaryReason: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 border-b border-border">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-warning/15 flex items-center justify-center shrink-0">
          <Triangle className="w-4 h-4 text-warning" fill="currentColor" />
        </div>
        <div>
          <h3 className="font-heading text-base font-semibold leading-tight">
            {title}
          </h3>
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
  );
}

function useConfirmDialogKeys(
  open: boolean,
  onConfirm: () => void,
  onCancel: () => void,
) {
  useEffect(() => {
    if (!open) {
      return () => {};
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
      if (event.key === "Enter") {
        onConfirm();
      }
    }
    globalThis.addEventListener("keydown", onKey);
    return () => {
      globalThis.removeEventListener("keydown", onKey);
    };
  }, [open, onConfirm, onCancel]);
}

function useConfirmDialogVisibility(
  open: boolean,
  dialogRef: { current: HTMLDialogElement | null },
) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, dialogRef]);
}

function ConfirmDialogPanel({
  title,
  primaryReason,
  changes,
  onConfirm,
  onCancel,
}: {
  title: string;
  primaryReason: string;
  changes: ConfigChange[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <ConfirmDialogHeader
        title={title}
        primaryReason={primaryReason}
        onCancel={onCancel}
      />
      <ConfirmCascadeList changes={changes} />
      <ConfirmDialogActions onConfirm={onConfirm} onCancel={onCancel} />
    </>
  );
}

/** Modal confirming a stack change that cascades other axis fields (Escape cancels, Enter confirms). */
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useConfirmDialogKeys(open, onConfirm, onCancel);
  useConfirmDialogVisibility(open, dialogRef);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="fixed inset-0 z-50 m-auto w-full max-w-md border border-border-strong bg-background p-0 shadow-2xl backdrop:bg-background/80 backdrop:backdrop-blur-sm open:flex open:flex-col"
    >
      <ConfirmDialogPanel
        title={title}
        primaryReason={primaryReason}
        changes={changes}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </dialog>
  );
}
