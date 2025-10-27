-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "quizzId" INTEGER;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_quizzId_fkey" FOREIGN KEY ("quizzId") REFERENCES "Quizz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
