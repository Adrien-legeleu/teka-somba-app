/*
  Warnings:

  - You are about to drop the column `status` on the `HelpRequest` table. All the data in the column will be lost.
  - Made the column `userId` on table `HelpRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."HelpRequest" DROP CONSTRAINT "HelpRequest_userId_fkey";

-- AlterTable
ALTER TABLE "public"."HelpRequest" DROP COLUMN "status",
ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."HelpRequest" ADD CONSTRAINT "HelpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
