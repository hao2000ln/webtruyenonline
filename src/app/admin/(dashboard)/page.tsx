export default function AdminPage() {
  return (
    <>
      <div>
        <p className="text-sm font-semibold text-teal-700">Tổng quan</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-slate-600">Quản lý nội dung và theo dõi hoạt động của Mộc Thư.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Truyện", "—"],
          ["Chương", "—"],
          ["Tác giả", "—"],
          ["Thể loại", "—"],
        ].map(([label, value]) => (
          <section key={label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-950">Bắt đầu quản lý nội dung</h2>
        <p className="mt-2 text-slate-600">Các màn hình CRUD sẽ được triển khai trên cấu trúc Admin App này.</p>
      </section>
    </>
  );
}
