DROP INDEX IF EXISTS "user_blog_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_blog_idx" ON "blog_likes" USING btree ("user_id","blog_id");