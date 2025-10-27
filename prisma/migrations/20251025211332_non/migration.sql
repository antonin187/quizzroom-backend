/*
  Warnings:

  - Made the column `quizzId` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_quizzId_fkey";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "quizzId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_quizzId_fkey" FOREIGN KEY ("quizzId") REFERENCES "Quizz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
