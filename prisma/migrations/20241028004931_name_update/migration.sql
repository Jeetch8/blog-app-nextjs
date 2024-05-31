/*
  Warnings:

  - You are about to drop the column `name` on the `blog_topics` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `bookmark_categories` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `title` to the `blog_topics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `bookmark_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "blog_comments" DROP CONSTRAINT "blog_comments_blogId_fkey";

-- DropForeignKey
ALTER TABLE "blog_likes" DROP CONSTRAINT "blog_likes_blogId_fkey";

-- DropForeignKey
ALTER TABLE "bookmark_categories" DROP CONSTRAINT "bookmark_categories_userId_fkey";

-- DropForeignKey
ALTER TABLE "bookmark_category_blogs" DROP CONSTRAINT "bookmark_category_blogs_blogId_fkey";

-- DropForeignKey
ALTER TABLE "bookmark_category_blogs" DROP CONSTRAINT "bookmark_category_blogs_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- AlterTable
ALTER TABLE "blog_topics" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "bookmark_categories" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bookmark_category_blogs" ALTER COLUMN "note" DROP NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "website";

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_categories" ADD CONSTRAINT "bookmark_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_category_blogs" ADD CONSTRAINT "bookmark_category_blogs_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_category_blogs" ADD CONSTRAINT "bookmark_category_blogs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "bookmark_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
