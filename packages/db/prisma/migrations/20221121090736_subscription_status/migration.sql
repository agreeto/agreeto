-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasTrialed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionStatus" "StripeSubscriptionStatus";
