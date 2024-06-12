/*
  Warnings:

  - A unique constraint covering the columns `[userId,blogId]` on the table `blog_comments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[blogId,date]` on the table `blog_stats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reading_histories" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "region" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "blog_comments_userId_blogId_key" ON "blog_comments"("userId", "blogId");

-- CreateIndex
CREATE INDEX "blog_stats_date_idx" ON "blog_stats"("date");

-- CreateIndex
CREATE INDEX "blog_stats_blogId_date_idx" ON "blog_stats"("blogId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "blog_stats_blogId_date_key" ON "blog_stats"("blogId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_username_key" ON "users"("email", "username");
