import type { StoryCardData } from "@/db/queries/stories";
import { StoryCard } from "./story-card";

type StorySectionProps = {
  title: string;
  eyebrow: string;
  stories: StoryCardData[];
};

export function StorySection({ title, eyebrow, stories }: StorySectionProps) {
  return (
    <section className="panel">
      <div className="mb-5 flex items-end justify-between border-b border-ui-border pb-4">
        <div>
          <p className="text-xs font-semibold text-primary">{eyebrow}</p>
          <h2 className="section-heading mt-1">{title}</h2>
        </div>
        <span className="text-xs text-content-muted">{stories.length} truyện</span>
      </div>
      {stories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {stories.map((story) => <StoryCard key={story.id} story={story} />)}
        </div>
      ) : (
        <p className="rounded-lg bg-page px-4 py-8 text-center text-sm text-content-secondary">
          Chưa có truyện phù hợp.
        </p>
      )}
    </section>
  );
}
