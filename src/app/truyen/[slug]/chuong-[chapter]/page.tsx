type Props = { params: Promise<{ slug: string; chapter: string }> };

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter } = await params;
  return (
    <main className="mx-auto max-w-[760px] px-5 py-10">
      <p className="text-center text-sm text-gray-500">{slug}</p>
      <h1 className="mt-2 text-center text-2xl font-bold">Chương {chapter}</h1>
      <article className="mt-10 space-y-6 text-[19px] leading-9">
        <p>Nội dung chương mẫu.</p>
        <p>Reader hiện đã có khung chiều rộng phù hợp để phát triển tiếp typography và reader settings.</p>
      </article>
    </main>
  );
}
