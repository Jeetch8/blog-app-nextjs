/*
  Warnings:

  - You are about to drop the column `date` on the `blog_stats` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "blog_stats_blogId_date_idx";

-- DropIndex
DROP INDEX "blog_stats_blogId_date_key";

-- DropIndex
DROP INDEX "blog_stats_date_idx";

-- AlterTable
ALTER TABLE "blog_stats" DROP COLUMN "date";

-- CreateIndex
CREATE INDEX "blog_stats_createdAt_idx" ON "blog_stats"("createdAt");

-- CreateIndex
CREATE INDEX "blog_stats_blogId_createdAt_idx" ON "blog_stats"("blogId", "createdAt");

-- CreateIndex
CREATE INDEX "reading_histories_blogId_idx" ON "reading_histories"("blogId");
