import type { StoryCardData } from "@/db/queries/stories";
import { StoryCard } from "./story-card";

export function StoryResults({ stories }: { stories: StoryCardData[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stories.map((story) => (
        <div key={story.id} className="story-card">
          <StoryCard story={story} />
        </div>
      ))}
    </div>
  );
}
