/*
  Warnings:

  - Added the required column `subject` to the `HelpRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HelpRequest" ADD COLUMN     "subject" TEXT NOT NULL;
