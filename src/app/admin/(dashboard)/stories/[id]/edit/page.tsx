import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { updateStory } from "@/app/admin/(dashboard)/stories/actions";
import { StoryForm } from "@/components/admin/story-form";
import { getAdminStoryForEdit, getAdminStoryOptions } from "@/db/queries/admin-stories";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Sửa truyện" };

export default async function EditStoryPage({ params }: Props) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const story = await getAdminStoryForEdit(id);
  if (!story) notFound();
  const options = await getAdminStoryOptions();
  const action = updateStory.bind(null, story.id);
  return <><nav className="text-sm text-slate-500"><Link href="/admin/stories" className="hover:text-teal-700">Truyện</Link> / Sửa</nav><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Sửa truyện</h1><p className="mt-2 text-slate-600">Cập nhật “{story.title}”.</p><StoryForm action={action} authors={options.authors} genres={options.genres} story={story} /></>;
}
