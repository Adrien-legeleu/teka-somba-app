/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,name]` on the table `CategoryField` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CategoryField_categoryId_name_key" ON "public"."CategoryField"("categoryId", "name");
