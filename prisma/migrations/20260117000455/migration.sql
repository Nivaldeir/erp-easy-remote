/*
  Warnings:

  - The `issuer` column on the `accounts_payables` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "accounts_payables" DROP COLUMN "issuer",
ADD COLUMN     "issuer" TIMESTAMP(3);
