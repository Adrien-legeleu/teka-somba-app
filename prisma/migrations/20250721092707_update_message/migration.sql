/*
  Warnings:

  - Made the column `adId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_adId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "adId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Message_adId_senderId_receiverId_idx" ON "Message"("adId", "senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
