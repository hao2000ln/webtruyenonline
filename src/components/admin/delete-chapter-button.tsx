"use client";

import { deleteChapter } from "@/app/admin/(dashboard)/chapters/actions";

export function DeleteChapterButton({ id, title }: { id: string; title: string }) {
  return <form action={deleteChapter.bind(null, id)} onSubmit={(event) => { if (!window.confirm(`Xóa chương “${title}”?`)) event.preventDefault(); }}><button type="submit" className="font-semibold text-red-600 hover:underline">Xóa</button></form>;
}
