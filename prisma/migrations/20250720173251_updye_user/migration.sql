/*
  Warnings:

  - Added the required column `prenom` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ad" ALTER COLUMN "isDon" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "prenom" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
