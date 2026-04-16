-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "complement" VARCHAR(100),
ADD COLUMN     "neighborhood" VARCHAR(100),
ADD COLUMN     "number" VARCHAR(20),
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "state" VARCHAR(2),
ADD COLUMN     "street" VARCHAR(200),
ADD COLUMN     "zip_code" VARCHAR(10);
