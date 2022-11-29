/*
  Warnings:

  - A unique constraint covering the columns `[userIdPrimary]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountPrimaryId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "userIdPrimary" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountPrimaryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_userIdPrimary_key" ON "Account"("userIdPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountPrimaryId_key" ON "User"("accountPrimaryId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountPrimaryId_fkey" FOREIGN KEY ("accountPrimaryId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
