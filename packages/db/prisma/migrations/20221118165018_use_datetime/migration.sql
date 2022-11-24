/*
  Warnings:

  - The `membershipStartDate` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `membershipEndDate` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `canceledDate` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paidUntil` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subscriptionCanceledDate` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "membershipStartDate",
ADD COLUMN     "membershipStartDate" TIMESTAMP(3),
DROP COLUMN "membershipEndDate",
ADD COLUMN     "membershipEndDate" TIMESTAMP(3),
DROP COLUMN "canceledDate",
ADD COLUMN     "canceledDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "paidUntil",
ADD COLUMN     "paidUntil" TIMESTAMP(3),
DROP COLUMN "subscriptionCanceledDate",
ADD COLUMN     "subscriptionCanceledDate" TIMESTAMP(3);
