"use client";

import { deleteStory } from "@/app/admin/(dashboard)/stories/actions";

export function DeleteStoryButton({ id, title }: { id: string; title: string }) {
  const action = deleteStory.bind(null, id);

  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(event) => {
          if (!window.confirm(`Xóa truyện “${title}” và toàn bộ chương liên quan?`)) {
            event.preventDefault();
          }
        }}
        className="text-sm font-semibold text-red-600 hover:underline"
      >
        Xóa
      </button>
    </form>
  );
}
