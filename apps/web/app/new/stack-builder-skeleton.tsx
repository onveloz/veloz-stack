export function StackBuilderSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-11 border-b border-border bg-secondary/40" />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] min-h-[calc(100vh-44px)]">
        <div className="hidden lg:block border-r border-border bg-secondary/20 p-5 space-y-4">
          <div className="h-8 bg-secondary rounded" />
          <div className="h-24 bg-secondary rounded" />
          <div className="h-32 bg-secondary rounded" />
        </div>
        <div className="p-6 space-y-6 pb-52">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-32 bg-secondary rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-16 bg-secondary border border-border rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block border-l border-border bg-secondary/20" />
      </div>
    </div>
  );
}
