-- AlterTable
ALTER TABLE "public"."Ad" ADD COLUMN     "acceptedCurrencies" TEXT[] DEFAULT ARRAY['USD']::TEXT[],
ADD COLUMN     "exchangeRate" DOUBLE PRECISION,
ADD COLUMN     "priceCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "priceFcfa" DOUBLE PRECISION;
