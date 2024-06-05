/*
  Warnings:

  - You are about to drop the column `markdown_content` on the `blogs` table. All the data in the column will be lost.
  - Added the required column `markdown_file_name` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `markdown_file_url` to the `blogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "markdown_content",
ADD COLUMN     "markdown_file_name" TEXT NOT NULL,
ADD COLUMN     "markdown_file_url" TEXT NOT NULL;
