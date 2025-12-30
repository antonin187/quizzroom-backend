/*
  Warnings:

  - You are about to drop the column `chossenIndex` on the `Answer` table. All the data in the column will be lost.
  - Added the required column `chosenIndex` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Made the column `playerId` on table `Answer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `questionId` on table `Answer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `roomId` on table `Answer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Answer" DROP CONSTRAINT "Answer_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Answer" DROP CONSTRAINT "Answer_roomId_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "chossenIndex",
ADD COLUMN     "chosenIndex" INTEGER NOT NULL,
ALTER COLUMN "playerId" SET NOT NULL,
ALTER COLUMN "questionId" SET NOT NULL,
ALTER COLUMN "roomId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
