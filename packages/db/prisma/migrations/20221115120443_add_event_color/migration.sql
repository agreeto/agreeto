-- CreateEnum
CREATE TYPE "RadixColor" AS ENUM ('tomato', 'red', 'crimson', 'pink', 'plum', 'purple', 'violet');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "eventColor" "RadixColor" NOT NULL DEFAULT 'violet';
