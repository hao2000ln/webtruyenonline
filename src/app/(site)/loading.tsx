export default function SiteLoading() {
  return (
    <div className="site-container py-8 sm:py-10 animate-pulse">
      {/* Hero Spotlight Skeleton */}
      <div className="h-64 sm:h-80 w-full rounded-3xl bg-slate-200/70" />

      {/* Main Grid Skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-2/3 w-full rounded-2xl bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-6 lg:col-span-4">
          <div className="h-8 w-36 rounded-lg bg-slate-200" />
          <div className="h-64 w-full rounded-3xl bg-slate-200/70" />
        </aside>
      </div>
    </div>
  );
}
