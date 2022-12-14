/*
  Warnings:

  - The `eventColor` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EventColorUserRadix" AS ENUM ('crimson', 'lime', 'yellow', 'sky', 'violet');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "eventColor",
ADD COLUMN     "eventColor" "EventColorUserRadix" NOT NULL DEFAULT 'violet';

-- DropEnum
DROP TYPE "RadixColor";
