import type { Metadata } from "next";
import Link from "next/link";
import { FollowButton } from "@/components/story/follow-button";
import { StoryCard } from "@/components/story/story-card";
import { getFollowedStories } from "@/db/queries/user-library";
import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Truyện đang theo dõi",
  robots: { index: false, follow: false },
};

export default async function FollowingPage() {
  const user = await requireUser();
  const followedStories = await getFollowedStories(user.id);

  return (
    <main className="site-container py-10 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Thư viện cá nhân</p>
      <h1 className="mt-2 text-[32px] font-bold leading-tight text-content">Truyện đang theo dõi</h1>
      {followedStories.length > 0 ? (
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {followedStories.map((story) => (
            <section key={story.id} className="panel">
              <StoryCard story={story} />
              <div className="mt-4 border-t border-ui-border pt-4">
                <FollowButton storySlug={story.slug} />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="panel mt-7 py-12 text-center">
          <p className="font-semibold text-content">Bạn chưa theo dõi truyện nào.</p>
          <p className="mt-2 text-sm text-content-secondary">Mở trang chi tiết truyện và chọn “Theo dõi”.</p>
          <Link href="/the-loai" className="button-primary mt-6">Khám phá truyện</Link>
        </section>
      )}
    </main>
  );
}
