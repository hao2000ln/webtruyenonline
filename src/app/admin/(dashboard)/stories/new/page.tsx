import type { Metadata } from "next";
import Link from "next/link";
import { createStory } from "@/app/admin/(dashboard)/stories/actions";
import { StoryForm } from "@/components/admin/story-form";
import { getAdminStoryOptions } from "@/db/queries/admin-stories";

export const metadata: Metadata = { title: "Thêm truyện" };

export default async function NewStoryPage() {
  const options = await getAdminStoryOptions();
  return <><nav className="text-sm text-slate-500"><Link href="/admin/stories" className="hover:text-teal-700">Truyện</Link> / Thêm mới</nav><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Thêm truyện</h1><p className="mt-2 text-slate-600">Tạo metadata truyện trước khi thêm chương.</p><StoryForm action={createStory} authors={options.authors} genres={options.genres} /></>;
}
