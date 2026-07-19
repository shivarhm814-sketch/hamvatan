-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminServiceType" ADD VALUE 'CONSTRUCTION_PARTNERSHIP';
ALTER TYPE "AdminServiceType" ADD VALUE 'CONSTRUCTION_CONTRACT';
ALTER TYPE "AdminServiceType" ADD VALUE 'RENOVATION';
ALTER TYPE "AdminServiceType" ADD VALUE 'SMART_HOME';
ALTER TYPE "AdminServiceType" ADD VALUE 'DESIGN_ENGINEERING';
