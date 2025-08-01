/*
  Warnings:

  - You are about to drop the column `birthdate` on the `PendingUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."PendingUser" DROP COLUMN "birthdate",
ADD COLUMN     "age" INTEGER;

-- DropEnum
DROP TYPE "public"."HelpStatus";
