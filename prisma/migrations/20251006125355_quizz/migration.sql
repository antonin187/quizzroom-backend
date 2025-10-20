/*
  Warnings:

  - You are about to drop the column `coverUrl` on the `Quizz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quizz" DROP COLUMN "coverUrl",
ADD COLUMN     "s3Key" TEXT;
