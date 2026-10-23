CREATE TABLE "reader_annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"quote_text" text NOT NULL,
	"prefix_text" varchar(200) DEFAULT '' NOT NULL,
	"suffix_text" varchar(200) DEFAULT '' NOT NULL,
	"start_offset" integer NOT NULL,
	"end_offset" integer NOT NULL,
	"color" varchar(16) DEFAULT 'yellow' NOT NULL,
	"note_text" text,
	"content_hash" varchar(64) NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reader_annotations_offsets_check" CHECK ("reader_annotations"."start_offset" >= 0 and "reader_annotations"."end_offset" > "reader_annotations"."start_offset")
);
--> statement-breakpoint
ALTER TABLE "reader_annotations" ADD CONSTRAINT "reader_annotations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reader_annotations" ADD CONSTRAINT "reader_annotations_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reader_annotations" ADD CONSTRAINT "reader_annotations_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reader_annotations_user_client_uidx" ON "reader_annotations" USING btree ("user_id","client_id");--> statement-breakpoint
CREATE INDEX "reader_annotations_user_chapter_idx" ON "reader_annotations" USING btree ("user_id","chapter_id","updated_at");--> statement-breakpoint
CREATE INDEX "reader_annotations_user_updated_idx" ON "reader_annotations" USING btree ("user_id","updated_at");