/*
  Warnings:

  - You are about to drop the column `city` on the `reading_histories` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `reading_histories` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `reading_histories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reading_histories" DROP CONSTRAINT "reading_histories_userId_fkey";

-- AlterTable
ALTER TABLE "reading_histories" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "region",
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reading_histories" ADD CONSTRAINT "reading_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
