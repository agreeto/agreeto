-- CreateEnum
CREATE TYPE "EventColorDirectoryUserRadix" AS ENUM ('orange', 'red', 'pink', 'tomato', 'brown');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paidUntil" INTEGER,
ADD COLUMN     "stripePlanId" TEXT,
ADD COLUMN     "subscriptionCanceledDate" INTEGER;
