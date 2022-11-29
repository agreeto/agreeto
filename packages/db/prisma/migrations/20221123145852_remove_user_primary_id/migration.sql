/*
  Warnings:

  - You are about to drop the column `userIdPrimary` on the `Account` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Account_userIdPrimary_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "userIdPrimary";
