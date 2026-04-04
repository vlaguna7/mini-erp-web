-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "observation" TEXT,
ADD COLUMN     "presence_indicator" VARCHAR(50),
ADD COLUMN     "sale_category" VARCHAR(50),
ADD COLUMN     "seller_id" INTEGER,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "surcharge" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "sale_payments" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "method" VARCHAR(20) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "installments" INTEGER,
    "card_brand" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_sale_payments_sale_id" ON "sale_payments"("sale_id");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
