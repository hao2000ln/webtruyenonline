CREATE TYPE "public"."story_status" AS ENUM('ONGOING', 'COMPLETED', 'HIATUS');--> statement-breakpoint
CREATE TABLE "authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"chapter_number" numeric(12, 3) NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"view_count" bigint DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "follows_user_id_story_id_pk" PRIMARY KEY("user_id","story_id")
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" varchar(255),
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_history" (
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reading_history_user_id_story_id_pk" PRIMARY KEY("user_id","story_id")
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"original_title" varchar(500),
	"description" text,
	"cover_url" text,
	"author_id" uuid,
	"status" "story_status" DEFAULT 'ONGOING' NOT NULL,
	"total_chapters" integer DEFAULT 0 NOT NULL,
	"view_count" bigint DEFAULT 0 NOT NULL,
	"follow_count" integer DEFAULT 0 NOT NULL,
	"rating_avg" numeric(3, 2) DEFAULT '0' NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"latest_chapter_at" timestamp with time zone,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_genres" (
	"story_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL,
	CONSTRAINT "story_genres_story_id_genre_id_pk" PRIMARY KEY("story_id","genre_id")
);
--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_genres" ADD CONSTRAINT "story_genres_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_genres" ADD CONSTRAINT "story_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "authors_slug_uidx" ON "authors" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "chapters_story_number_uidx" ON "chapters" USING btree ("story_id","chapter_number");--> statement-breakpoint
CREATE UNIQUE INDEX "chapters_story_slug_uidx" ON "chapters" USING btree ("story_id","slug");--> statement-breakpoint
CREATE INDEX "chapters_story_published_idx" ON "chapters" USING btree ("story_id","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "genres_slug_uidx" ON "genres" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reading_history_user_time_idx" ON "reading_history" USING btree ("user_id","last_read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "stories_slug_uidx" ON "stories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "stories_latest_chapter_idx" ON "stories" USING btree ("latest_chapter_at");--> statement-breakpoint
CREATE INDEX "stories_author_idx" ON "stories" USING btree ("author_id");