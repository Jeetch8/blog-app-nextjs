/*
  Warnings:

  - The values [publish,draft] on the enum `BlogStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BlogStatus_new" AS ENUM ('PUBLISHED', 'DRAFT');
ALTER TABLE "blogs" ALTER COLUMN "blog_status" TYPE "BlogStatus_new" USING ("blog_status"::text::"BlogStatus_new");
ALTER TYPE "BlogStatus" RENAME TO "BlogStatus_old";
ALTER TYPE "BlogStatus_new" RENAME TO "BlogStatus";
DROP TYPE "BlogStatus_old";
COMMIT;
