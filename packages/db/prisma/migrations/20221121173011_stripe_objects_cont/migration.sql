/*
  Warnings:

  - You are about to drop the column `default_source` on the `StripeCustomer` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `StripeCustomer` table. All the data in the column will be lost.
  - You are about to drop the column `default_payment_method` on the `StripeSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `default_source` on the `StripeSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `StripeSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `items` on the `StripeSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `latest_invoice` on the `StripeSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `StripeSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `StripeSubscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StripeCustomer" DROP COLUMN "default_source",
DROP COLUMN "discount";

-- AlterTable
ALTER TABLE "StripeSubscription" DROP COLUMN "default_payment_method",
DROP COLUMN "default_source",
DROP COLUMN "discount",
DROP COLUMN "items",
DROP COLUMN "latest_invoice",
DROP COLUMN "quantity",
DROP COLUMN "schedule";
