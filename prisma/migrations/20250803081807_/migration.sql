/*
  Warnings:

  - You are about to drop the column `acceptedCurrencies` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `exchangeRate` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `priceCurrency` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `priceFcfa` on the `Ad` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Ad" DROP COLUMN "acceptedCurrencies",
DROP COLUMN "exchangeRate",
DROP COLUMN "priceCurrency",
DROP COLUMN "priceFcfa";
