import {
  bigint,
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const storyStatusEnum = pgEnum("story_status", ["ONGOING", "COMPLETED", "HIATUS"]);

export const authors = pgTable("authors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("authors_slug_uidx").on(table.slug)]);

export const stories = pgTable("stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  originalTitle: varchar("original_title", { length: 500 }),
  description: text("description"),
  coverUrl: text("cover_url"),
  authorId: uuid("author_id").references(() => authors.id, { onDelete: "set null" }),
  status: storyStatusEnum("status").default("ONGOING").notNull(),
  totalChapters: integer("total_chapters").default(0).notNull(),
  viewCount: bigint("view_count", { mode: "number" }).default(0).notNull(),
  followCount: integer("follow_count").default(0).notNull(),
  ratingAvg: numeric("rating_avg", { precision: 3, scale: 2 }).default("0").notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  latestChapterAt: timestamp("latest_chapter_at", { withTimezone: true }),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("stories_slug_uidx").on(table.slug),
  index("stories_latest_chapter_idx").on(table.latestChapterAt),
  index("stories_author_idx").on(table.authorId),
]);

export const chapters = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  chapterNumber: numeric("chapter_number", { precision: 12, scale: 3 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  content: text("content").notNull(),
  wordCount: integer("word_count").default(0).notNull(),
  viewCount: bigint("view_count", { mode: "number" }).default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("chapters_story_number_uidx").on(table.storyId, table.chapterNumber),
  uniqueIndex("chapters_story_slug_uidx").on(table.storyId, table.slug),
  index("chapters_story_published_idx").on(table.storyId, table.publishedAt),
  // Covers prev/next navigation queries: WHERE storyId=? AND isPublished=true AND chapterNumber </>?
  index("chapters_nav_idx").on(table.storyId, table.isPublished, table.chapterNumber),
]);

export const genres = pgTable("genres", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("genres_slug_uidx").on(table.slug)]);

export const storyGenres = pgTable("story_genres", {
  storyId: uuid("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  genreId: uuid("genre_id").notNull().references(() => genres.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.storyId, table.genreId] })]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: varchar("display_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const follows = pgTable("follows", {
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  storyId: uuid("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.storyId] })]);

export const readingHistory = pgTable("reading_history", {
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  storyId: uuid("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  progress: integer("progress").default(0).notNull(),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.storyId] }),
  index("reading_history_user_time_idx").on(table.userId, table.lastReadAt),
]);
