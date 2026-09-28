type Props = { params: Promise<{ slug: string }> };

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="mb-2 text-sm text-gray-500">Truyện</p>
      <h1 className="text-3xl font-bold">{slug}</h1>
      <p className="mt-6 text-gray-600">Trang chi tiết truyện - sẽ nối database ở bước sau.</p>
    </main>
  );
}
