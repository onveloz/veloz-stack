/** Circular selection indicator for exclusive-choice rows. */
export function ChoiceIndicator({ active }: { active: boolean }) {
  return (
    <div
      className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
        active ? "border-brand bg-brand" : "border-border-strong"
      }`}
    >
      {active ? (
        <span className="w-1.5 h-1.5 rounded-full bg-brand-foreground" />
      ) : null}
    </div>
  );
}
