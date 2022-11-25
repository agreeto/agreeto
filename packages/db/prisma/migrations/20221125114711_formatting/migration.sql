-- CreateEnum
CREATE TYPE "IntroSentenceType" AS ENUM ('DEFAULT', 'CUSTOM', 'NONE');

-- CreateEnum
CREATE TYPE "DateFormat" AS ENUM ('MMMM_d_EEEE', 'MM_dd_yyyy', 'yyyy_MM_dd', 'MMMM_dd_yyyy', 'EEEE_MM_dd_yyyy', 'MMM_dd_EEEE', 'EEEE_M_d', 'EEE_MM_dd');

-- CreateTable
CREATE TABLE "formattings" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "dateFormat" "DateFormat" NOT NULL,
    "introSentenceType" "IntroSentenceType" NOT NULL,
    "introSentence" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formattings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "formattings_userId_language_key" ON "formattings"("userId", "language");

-- AddForeignKey
ALTER TABLE "formattings" ADD CONSTRAINT "formattings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
