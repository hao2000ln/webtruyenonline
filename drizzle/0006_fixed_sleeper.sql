DROP INDEX "stories_latest_chapter_idx";--> statement-breakpoint
CREATE INDEX "follows_story_idx" ON "follows" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "stories_is_published_latest_idx" ON "stories" USING btree ("is_published","latest_chapter_at");--> statement-breakpoint
CREATE INDEX "stories_is_published_view_count_idx" ON "stories" USING btree ("is_published","view_count");--> statement-breakpoint
CREATE INDEX "stories_is_published_at_idx" ON "stories" USING btree ("is_published","published_at");