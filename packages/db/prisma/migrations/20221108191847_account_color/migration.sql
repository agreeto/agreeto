/*
  Warnings:

  - Added the required column `colorId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "colorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EventGroup" ADD COLUMN     "appointmentUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paidUntil" INTEGER,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePlanId" TEXT,
ADD COLUMN     "subscriptionCanceledDate" INTEGER;

-- CreateTable
CREATE TABLE "AccountColor" (
    "id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "darkColor" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "membershipPlan" TEXT NOT NULL,
    "membership" "Membership" NOT NULL,
    "membershipStartDate" INTEGER,
    "membershipEndDate" INTEGER,
    "canceledDate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "AccountColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
