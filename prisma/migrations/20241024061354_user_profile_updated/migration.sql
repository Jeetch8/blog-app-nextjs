/*
  Warnings:

  - You are about to drop the column `followers` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `following` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "followers",
DROP COLUMN "following",
ADD COLUMN     "followers_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "following_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tagline" TEXT;
