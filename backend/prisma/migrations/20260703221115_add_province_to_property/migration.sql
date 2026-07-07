-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "province" TEXT;

-- CreateIndex
CREATE INDEX "properties_province_idx" ON "properties"("province");
