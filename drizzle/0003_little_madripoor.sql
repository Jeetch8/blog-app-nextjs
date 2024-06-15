ALTER TABLE "blog_stats" ALTER COLUMN "created_at" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "bookmark_category_blogs" ADD COLUMN "bookmarked_by_user_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmark_category_blogs" ADD CONSTRAINT "bookmark_category_blogs_bookmarked_by_user_id_users_id_fk" FOREIGN KEY ("bookmarked_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
