/*
  Warnings:

  - You are about to drop the column `workerSpaceId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_workerSpaceId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "workerSpaceId";

-- CreateTable
CREATE TABLE "_UserToWorkerSpace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserToWorkerSpace_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserToWorkerSpace_B_index" ON "_UserToWorkerSpace"("B");

-- AddForeignKey
ALTER TABLE "_UserToWorkerSpace" ADD CONSTRAINT "_UserToWorkerSpace_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkerSpace" ADD CONSTRAINT "_UserToWorkerSpace_B_fkey" FOREIGN KEY ("B") REFERENCES "worker_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
