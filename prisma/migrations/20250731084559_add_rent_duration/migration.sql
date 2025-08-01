-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "durationUnit" "DurationUnit",
ADD COLUMN     "durationValue" INTEGER;
