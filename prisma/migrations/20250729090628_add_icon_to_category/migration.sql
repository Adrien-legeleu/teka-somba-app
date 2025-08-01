/*
  Warnings:

  - Added the required column `type` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('FOR_SALE', 'FOR_RENT');

-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "type" "AdType" NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "allowRent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "icon" TEXT NOT NULL;
