const sections = ["Mới cập nhật", "Truyện mới", "Truyện hot", "Truyện hoàn thành"];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="mb-10 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Đọc Truyện Chữ</h1>
          <p className="text-sm text-gray-500">MVP skeleton</p>
        </div>
        <input
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none"
          placeholder="Tìm tên truyện, tác giả..."
        />
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{section}</h2>
            <p className="text-sm text-gray-500">Dữ liệu sẽ được nối với Supabase ở bước tiếp theo.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
