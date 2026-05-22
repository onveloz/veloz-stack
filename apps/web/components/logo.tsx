export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="w-6 h-6 bg-brand flex items-center justify-center brand-glow">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 1 L13 1 L7 13 Z" fill="white" />
        </svg>
      </div>
      <span className="font-heading font-bold text-[15px] tracking-tight">
        veloz<span className="text-brand">/</span>stack
      </span>
    </div>
  );
}
