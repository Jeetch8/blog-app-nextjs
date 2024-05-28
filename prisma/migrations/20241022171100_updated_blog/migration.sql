/*
  Warnings:

  - You are about to drop the column `content` on the `Blog` table. All the data in the column will be lost.
  - Added the required column `html_content` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `markdown_content` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Blog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('publish', 'draft');

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "content",
ADD COLUMN     "html_content" TEXT NOT NULL,
ADD COLUMN     "markdown_content" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "BlogStatus" NOT NULL;

-- DropEnum
DROP TYPE "BlogType";
