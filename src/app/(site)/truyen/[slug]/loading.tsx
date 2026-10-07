export default function StoryDetailLoading() {
  return (
    <main className="site-container py-6 sm:py-10 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-slate-200" />
        <span className="text-slate-300">&gt;</span>
        <div className="h-4 w-24 rounded bg-slate-200" />
        <span className="text-slate-300">&gt;</span>
        <div className="h-4 w-36 rounded bg-slate-200" />
      </div>

      {/* Hero Story Card Skeleton */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image Skeleton */}
          <div className="mx-auto md:mx-0 h-64 w-44 sm:h-72 sm:w-48 shrink-0 rounded-2xl bg-slate-200" />

          {/* Details Skeleton */}
          <div className="flex flex-grow flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-slate-200" />
                <div className="h-6 w-24 rounded-full bg-slate-200" />
              </div>
              <div className="h-9 w-3/4 rounded-xl bg-slate-200" />
              <div className="flex gap-4">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
              <div className="h-24 w-full rounded-2xl bg-slate-100" />
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="h-12 w-40 rounded-xl bg-teal-200/60" />
              <div className="h-12 w-40 rounded-xl bg-slate-200" />
              <div className="h-12 w-32 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Chapter List Section Skeleton */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div className="h-7 w-40 rounded-lg bg-slate-200" />
          <div className="h-6 w-32 rounded-full bg-slate-200" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
    </main>
  );
}
