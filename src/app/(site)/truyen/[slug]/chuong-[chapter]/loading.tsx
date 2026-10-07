export default function ChapterLoading() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-16 animate-pulse">
      <div className="mx-auto max-w-3xl px-4 space-y-6">
        <div className="h-6 w-32 rounded bg-slate-200 mx-auto" />
        <div className="h-9 w-3/4 rounded-xl bg-slate-200 mx-auto" />
        <div className="h-4 w-48 rounded bg-slate-200 mx-auto" />

        <div className="rounded-2xl bg-white p-8 border border-slate-200/80 shadow-sm space-y-4 mt-8">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-11/12 rounded bg-slate-200" />
          <div className="h-4 w-4/5 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
