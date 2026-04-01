-- AlterTable
ALTER TABLE "products" ADD COLUMN     "barcode" VARCHAR(50),
ADD COLUMN     "brand_id" INTEGER,
ADD COLUMN     "category_id" INTEGER,
ADD COLUMN     "cest" VARCHAR(10),
ADD COLUMN     "cfop" VARCHAR(10),
ADD COLUMN     "collection_id" INTEGER,
ADD COLUMN     "depth" DECIMAL(10,2),
ADD COLUMN     "ecommerce_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ecommerce_description" TEXT,
ADD COLUMN     "ecommerce_seo_description" VARCHAR(500),
ADD COLUMN     "ecommerce_seo_title" VARCHAR(200),
ADD COLUMN     "height" DECIMAL(10,2),
ADD COLUMN     "icms_cst" VARCHAR(10),
ADD COLUMN     "icms_origin" VARCHAR(10),
ADD COLUMN     "markup" DECIMAL(10,2),
ADD COLUMN     "max_stock" INTEGER,
ADD COLUMN     "ncm" VARCHAR(10),
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "unit_type" VARCHAR(10),
ADD COLUMN     "weight" DECIMAL(10,3),
ADD COLUMN     "width" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_brands" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_collections" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_product_categories_user_id" ON "product_categories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_user_id_name_key" ON "product_categories"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_product_brands_user_id" ON "product_brands"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_brands_user_id_name_key" ON "product_brands"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_product_collections_user_id" ON "product_collections"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_collections_user_id_name_key" ON "product_collections"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_product_images_product_id" ON "product_images"("product_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "product_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "product_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_brands" ADD CONSTRAINT "product_brands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
