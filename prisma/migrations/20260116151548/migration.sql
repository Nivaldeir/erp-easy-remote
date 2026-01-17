-- CreateEnum
CREATE TYPE "StatusContracts" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'CANCELLED', 'FINISHED');

-- CreateEnum
CREATE TYPE "StatusAccountsPayable" AS ENUM ('PENDING', 'PAID', 'LATE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "workerSpaceId" TEXT;

-- CreateTable
CREATE TABLE "worker_spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "works" (
    "id" TEXT NOT NULL,
    "worker_space_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts_payables" (
    "id" TEXT NOT NULL,
    "worker_space_id" TEXT NOT NULL,
    "nf" TEXT,
    "issuer" TEXT,
    "supplier" TEXT,
    "product_and_services" TEXT,
    "construction_cost" TEXT,
    "formPayment" TEXT,
    "valueAmount" DOUBLE PRECISION NOT NULL,
    "installments" INTEGER,
    "valueTotal" DOUBLE PRECISION NOT NULL,
    "maturity" TIMESTAMP(3) NOT NULL,
    "launchDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3) NOT NULL,
    "status" "StatusAccountsPayable" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_payables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "worker_space_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mark" TEXT,
    "model" TEXT,
    "year" TEXT,
    "hours" INTEGER,
    "amountDays" INTEGER,
    "amountMoths" INTEGER,
    "description" TEXT,
    "nextMaintenance" TIMESTAMP(3),
    "lastMaintenance" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "worker_space_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "StatusContracts" NOT NULL DEFAULT 'PENDING',
    "clientName" TEXT,
    "workId" TEXT,
    "initDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "valueDaily" DOUBLE PRECISION,
    "amountDays" INTEGER,
    "amountTotal" DOUBLE PRECISION,
    "equipmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workerSpaceId_fkey" FOREIGN KEY ("workerSpaceId") REFERENCES "worker_spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_worker_space_id_fkey" FOREIGN KEY ("worker_space_id") REFERENCES "worker_spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_payables" ADD CONSTRAINT "accounts_payables_worker_space_id_fkey" FOREIGN KEY ("worker_space_id") REFERENCES "worker_spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_worker_space_id_fkey" FOREIGN KEY ("worker_space_id") REFERENCES "worker_spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_worker_space_id_fkey" FOREIGN KEY ("worker_space_id") REFERENCES "worker_spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
