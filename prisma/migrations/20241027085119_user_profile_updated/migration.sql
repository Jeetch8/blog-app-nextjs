/*
  Warnings:

  - You are about to drop the column `available_for_hire` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "available_for_hire",
ADD COLUMN     "available_for" TEXT;
