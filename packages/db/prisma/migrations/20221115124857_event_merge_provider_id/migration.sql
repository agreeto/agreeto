/*
  Warnings:

  - You are about to drop the column `googleId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `microsoftId` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "googleId",
DROP COLUMN "microsoftId",
ADD COLUMN     "providerEventId" TEXT;
