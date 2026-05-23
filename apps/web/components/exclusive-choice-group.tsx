"use client";

import type { KeyboardEvent } from "react";

import { ExclusiveChoiceItem } from "@/components/exclusive-choice-item";

function useChoiceKeyboard<T extends string>(
  choices: readonly T[],
  value: T,
  onChange: (v: T) => void,
) {
  function move(delta: number) {
    const idx = choices.indexOf(value);
    const nextIndex = (idx + delta + choices.length) % choices.length;
    const next = choices[nextIndex];
    if (next === undefined) {
      return;
    }
    onChange(next);
  }

  return function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  };
}

/** Radio-style choice group with arrow-key navigation between options. */
export function ExclusiveChoiceGroup<T extends string>({
  title,
  hint,
  choices,
  labels,
  value,
  logos,
  onChange,
}: {
  title: string;
  hint?: string;
  choices: readonly T[];
  labels: Record<T, { label: string; detail: string }>;
  value: T;
  logos?: Partial<Record<T, string>>;
  onChange: (v: T) => void;
}) {
  const onKeyDown = useChoiceKeyboard(choices, value, onChange);

  return (
    <fieldset className="border border-border p-3 bg-secondary/40 space-y-2">
      <legend>
        <p className="text-sm font-medium">{title}</p>
        {hint ? (
          <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
        ) : null}
      </legend>
      <ul className="border border-border divide-y divide-border bg-background">
        {choices.map((id) => (
          <ExclusiveChoiceItem
            key={id}
            id={id}
            active={value === id}
            meta={labels[id]}
            logoId={logos?.[id]}
            title={title}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        ))}
      </ul>
    </fieldset>
  );
}
