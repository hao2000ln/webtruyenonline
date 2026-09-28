import Link from "next/link";
import type { StoryCardData } from "@/db/queries/stories";
import { formatCompactNumber, getStoryStatusLabel } from "@/lib/format";
import { StoryCover } from "./story-cover";

export function StoryCard({ story }: { story: StoryCardData }) {
  return (
    <article className="group grid grid-cols-[80px_1fr] gap-4">
      <Link href={`/truyen/${story.slug}`} aria-label={`Xem truyện ${story.title}`}>
        <StoryCover
          title={story.title}
          slug={story.slug}
          coverUrl={story.coverUrl}
          className="h-[110px] w-20 transition group-hover:opacity-90"
        />
      </Link>
      <div className="min-w-0 py-1">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-content">
          <Link href={`/truyen/${story.slug}`} className="transition hover:text-primary">
            {story.title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-[13px] text-content-secondary">{story.authorName ?? "Khuyết danh"}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
          <span className="font-medium text-primary">{story.totalChapters} chương</span>
          <span className="text-content-muted">{formatCompactNumber(story.viewCount)} lượt đọc</span>
        </div>
        <span className={`badge mt-2 ${story.status === "COMPLETED" ? "badge-success" : story.status === "HIATUS" ? "badge-accent" : "badge-primary"}`}>
          {getStoryStatusLabel(story.status)}
        </span>
      </div>
    </article>
  );
}
