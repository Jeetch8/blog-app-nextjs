/*
  Warnings:

  - A unique constraint covering the columns `[userId,blogId]` on the table `blog_like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "blog_like_userId_blogId_key" ON "blog_like"("userId", "blogId");
