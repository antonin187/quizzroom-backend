-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "media_s3Key" TEXT,
    "choices" TEXT[],
    "answerIndex" INTEGER NOT NULL,
    "quizzId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizzId_fkey" FOREIGN KEY ("quizzId") REFERENCES "Quizz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
