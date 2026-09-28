type AdminPlaceholderProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export function AdminPlaceholder({ title, description, actionLabel }: AdminPlaceholderProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal-700">Quản trị nội dung</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>
        {actionLabel ? (
          <button type="button" disabled className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white opacity-60">
            {actionLabel}
          </button>
        ) : null}
      </div>
      <section className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-semibold text-slate-700">Màn hình đang sẵn sàng cho bước CRUD tiếp theo.</p>
      </section>
    </>
  );
}
