-- Tối ưu hiệu năng: partial indexes, trigram search, follows index
-- Supabase free: không cần superuser, pg_trgm có sẵn trong shared_preload_libraries

-- 1. Bật extension trigram để hỗ trợ ILIKE '%query%' có index
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Partial indexes cho stories đã published (thay thế index cũ chỉ trên column)
--    Tất cả public query đều filter WHERE is_published = true
--    Partial index nhỏ hơn nhiều lần, Postgres ưu tiên dùng
DROP INDEX IF EXISTS "stories_latest_chapter_idx";
CREATE INDEX "stories_published_latest_idx"
  ON "stories" ("latest_chapter_at" DESC NULLS LAST)
  WHERE "is_published" = true;

CREATE INDEX "stories_published_view_count_idx"
  ON "stories" ("view_count" DESC)
  WHERE "is_published" = true;

CREATE INDEX "stories_published_at_idx"
  ON "stories" ("published_at" DESC)
  WHERE "is_published" = true;

-- 3. Trigram GIN indexes cho ILIKE full-text style search
CREATE INDEX "stories_title_trgm_idx"
  ON "stories" USING gin ("title" gin_trgm_ops);

CREATE INDEX "authors_name_trgm_idx"
  ON "authors" USING gin ("name" gin_trgm_ops);

-- 4. Index ngược cho follows.story_id
--    PK là (user_id, story_id), nhưng query theo story_id riêng cần index này
CREATE INDEX "follows_story_idx"
  ON "follows" ("story_id");

-- 5. Partial index cho chapters published — bổ sung cho chapters_nav_idx
--    Covers: getStoryChapters WHERE story_id=? AND is_published=true ORDER BY chapter_number
CREATE INDEX "chapters_published_number_idx"
  ON "chapters" ("story_id", "chapter_number")
  WHERE "is_published" = true;
