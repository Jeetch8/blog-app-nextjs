ALTER TABLE "blog_stats" DROP CONSTRAINT "blog_stats_blog_id_blogs_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "email_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "username_idx";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_stats" ADD CONSTRAINT "blog_stats_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_idx" ON "users" USING btree (lower("username"));