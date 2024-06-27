ALTER TABLE "blog_topics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "blog_topics" CASCADE;--> statement-breakpoint
ALTER TABLE "blogs" DROP CONSTRAINT "blogs_topic_id_blog_topics_id_fk";
--> statement-breakpoint
ALTER TABLE "reading_histories" DROP CONSTRAINT "reading_histories_blog_id_blogs_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "embedding_idx";--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reading_histories" ADD CONSTRAINT "reading_histories_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "text_search_idx" ON "blogs" USING gin (to_tsvector('english', "title" || ' ' || "content"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_index" ON "blogs" USING gin (unnest(tags));--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "markdown_file_url";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "markdown_file_name";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "embeddings";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "topic_id";