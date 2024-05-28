/*
  Warnings:

  - You are about to drop the `Blog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bookmark_Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bookmark_Category_Blog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reading_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_topic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Bookmark_Category" DROP CONSTRAINT "Bookmark_Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "Bookmark_Category_Blog" DROP CONSTRAINT "Bookmark_Category_Blog_blogId_fkey";

-- DropForeignKey
ALTER TABLE "Bookmark_Category_Blog" DROP CONSTRAINT "Bookmark_Category_Blog_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Reading_history" DROP CONSTRAINT "Reading_history_blogId_fkey";

-- DropForeignKey
ALTER TABLE "Reading_history" DROP CONSTRAINT "Reading_history_userId_fkey";

-- DropForeignKey
ALTER TABLE "blog_comment" DROP CONSTRAINT "blog_comment_blogId_fkey";

-- DropForeignKey
ALTER TABLE "blog_comment" DROP CONSTRAINT "blog_comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "blog_like" DROP CONSTRAINT "blog_like_blogId_fkey";

-- DropForeignKey
ALTER TABLE "blog_like" DROP CONSTRAINT "blog_like_userId_fkey";

-- DropForeignKey
ALTER TABLE "blog_stats" DROP CONSTRAINT "blog_stats_blogId_fkey";

-- DropTable
DROP TABLE "Blog";

-- DropTable
DROP TABLE "Bookmark_Category";

-- DropTable
DROP TABLE "Bookmark_Category_Blog";

-- DropTable
DROP TABLE "Reading_history";

-- DropTable
DROP TABLE "blog_comment";

-- DropTable
DROP TABLE "blog_like";

-- DropTable
DROP TABLE "blog_topic";

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "website_url" TEXT,
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "twitter_url" TEXT,
    "available_for_hire" BOOLEAN NOT NULL DEFAULT false,
    "tech_stack" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmark_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmark_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmark_category_blogs" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmark_category_blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "html_content" TEXT NOT NULL,
    "markdown_content" TEXT NOT NULL,
    "blog_status" "BlogStatus" NOT NULL,
    "short_description" TEXT NOT NULL,
    "number_of_views" INTEGER NOT NULL DEFAULT 0,
    "number_of_likes" INTEGER NOT NULL DEFAULT 0,
    "number_of_comments" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "banner_img" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "blog_likes_userId_blogId_key" ON "blog_likes"("userId", "blogId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_categories" ADD CONSTRAINT "bookmark_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_category_blogs" ADD CONSTRAINT "bookmark_category_blogs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "bookmark_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_category_blogs" ADD CONSTRAINT "bookmark_category_blogs_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_stats" ADD CONSTRAINT "blog_stats_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "blog_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_histories" ADD CONSTRAINT "reading_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_histories" ADD CONSTRAINT "reading_histories_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
