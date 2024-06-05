/*
  Warnings:

  - You are about to drop the column `html_content` on the `blogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "html_content",
ADD COLUMN     "embeddings" TEXT[],
ADD COLUMN     "reading_time" INTEGER NOT NULL DEFAULT 0;
