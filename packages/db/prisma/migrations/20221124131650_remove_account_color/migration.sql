/*
  Warnings:

  - You are about to drop the `AccountColor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_colorId_fkey";

-- DropTable
DROP TABLE "AccountColor";
