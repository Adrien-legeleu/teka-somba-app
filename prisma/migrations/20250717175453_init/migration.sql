/*
  Warnings:

  - You are about to drop the column `city` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Ad` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Ad` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - The `images` column on the `Ad` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Ad" DROP CONSTRAINT "Ad_userId_fkey";

-- AlterTable
ALTER TABLE "Ad" DROP COLUMN "city",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
DROP COLUMN "views",
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ALTER COLUMN "price" SET DATA TYPE INTEGER,
DROP COLUMN "images",
ADD COLUMN     "images" JSONB;

-- CreateTable
CREATE TABLE "AdField" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "categoryFieldId" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "AdField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryField" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,

    CONSTRAINT "CategoryField_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdField" ADD CONSTRAINT "AdField_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdField" ADD CONSTRAINT "AdField_categoryFieldId_fkey" FOREIGN KEY ("categoryFieldId") REFERENCES "CategoryField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryField" ADD CONSTRAINT "CategoryField_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
