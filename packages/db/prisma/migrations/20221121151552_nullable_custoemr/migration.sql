-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_stripeCustomerId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "stripeCustomerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_stripeCustomerId_fkey" FOREIGN KEY ("stripeCustomerId") REFERENCES "StripeCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
