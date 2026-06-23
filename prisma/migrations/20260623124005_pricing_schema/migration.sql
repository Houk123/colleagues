/*
  Warnings:

  - The values [income,expense] on the enum `TransactionProjectType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('fixed_budget', 'hourly');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('full', 'installments');

-- CreateEnum
CREATE TYPE "PhaseType" AS ENUM ('development', 'support', 'custom');

-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'overdue');

-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'closed';

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionProjectType_new" AS ENUM ('deposit', 'charge', 'refund', 'adjustment');
ALTER TABLE "transactions_projects" ALTER COLUMN "type" TYPE "TransactionProjectType_new" USING ("type"::text::"TransactionProjectType_new");
ALTER TYPE "TransactionProjectType" RENAME TO "TransactionProjectType_old";
ALTER TYPE "TransactionProjectType_new" RENAME TO "TransactionProjectType";
DROP TYPE "public"."TransactionProjectType_old";
COMMIT;

-- AlterTable
ALTER TABLE "project_services" ADD COLUMN     "discountPercent" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "transactions_projects" ADD COLUMN     "phaseId" TEXT;

-- AlterTable
ALTER TABLE "work_logs" ADD COLUMN     "amount" DECIMAL(12,2),
ADD COLUMN     "phaseId" TEXT,
ADD COLUMN     "resolvedRate" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "department_services" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_discounts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "serviceId" TEXT,
    "discountPercent" DECIMAL(5,2) NOT NULL,
    "validFrom" DATE NOT NULL,
    "validTo" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_phases" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PhaseType" NOT NULL DEFAULT 'development',
    "pricingMode" "PricingMode" NOT NULL DEFAULT 'hourly',
    "budgetTotal" DECIMAL(14,2),
    "spentAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paymentMode" "PaymentMode",
    "installmentAmount" DECIMAL(14,2),
    "billingPeriod" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" "PhaseStatus" NOT NULL DEFAULT 'draft',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "startDate" DATE,
    "endDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_payments" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "transactionProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_services_departmentId_serviceId_key" ON "department_services"("departmentId", "serviceId");

-- AddForeignKey
ALTER TABLE "transactions_projects" ADD CONSTRAINT "transactions_projects_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_services" ADD CONSTRAINT "department_services_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_services" ADD CONSTRAINT "department_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_discounts" ADD CONSTRAINT "organization_discounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_discounts" ADD CONSTRAINT "organization_discounts_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_payments" ADD CONSTRAINT "project_payments_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "project_phases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
