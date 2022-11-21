/*
  Warnings:

  - You are about to drop the column `paidUntil` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripePlanId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionCanceledDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.
  - Made the column `stripeCustomerId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "paidUntil",
DROP COLUMN "stripePlanId",
DROP COLUMN "subscriptionCanceledDate",
DROP COLUMN "subscriptionStatus",
ALTER COLUMN "stripeCustomerId" SET NOT NULL;

-- CreateTable
CREATE TABLE "StripeCustomer" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "balance" INTEGER NOT NULL,
    "description" TEXT,
    "created" TIMESTAMP(3) NOT NULL,
    "currency" TEXT,
    "default_source" TEXT,
    "delinquent" BOOLEAN NOT NULL,
    "discount" JSONB,
    "livemode" BOOLEAN NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "StripeCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeSubscription" (
    "id" TEXT NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL,
    "collection_method" TEXT,
    "default_payment_method" TEXT,
    "default_source" TEXT,
    "discount" JSONB,
    "items" JSONB,
    "latest_invoice" TEXT,
    "livemode" BOOLEAN NOT NULL,
    "metadata" JSONB,
    "quantity" INTEGER,
    "schedule" TEXT,
    "start_date" TIMESTAMP(3),
    "status" "StripeSubscriptionStatus" NOT NULL,
    "stripeCustomerId" TEXT,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL,
    "canceled_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "trial_start" TIMESTAMP(3),

    CONSTRAINT "StripeSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_id_key" ON "StripeCustomer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StripeSubscription_id_key" ON "StripeSubscription"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_stripeCustomerId_fkey" FOREIGN KEY ("stripeCustomerId") REFERENCES "StripeCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeSubscription" ADD CONSTRAINT "StripeSubscription_stripeCustomerId_fkey" FOREIGN KEY ("stripeCustomerId") REFERENCES "StripeCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
