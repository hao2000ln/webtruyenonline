export default function GenreLoading() {
  return (
    <main className="site-container min-h-[60vh] py-10 animate-pulse">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-7 border-b border-slate-200 pb-7 space-y-3">
        <div className="h-4 w-20 rounded bg-teal-200" />
        <div className="h-9 w-64 rounded-xl bg-slate-200" />
        <div className="h-5 w-full max-w-xl rounded bg-slate-200" />
      </div>

      <div className="my-6 flex gap-2">
        <div className="h-9 w-28 rounded-xl bg-slate-200" />
        <div className="h-9 w-24 rounded-xl bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-2/3 w-full rounded-2xl bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </main>
  );
}
