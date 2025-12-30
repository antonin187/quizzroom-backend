import { Module } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { RoomService } from 'src/room/room.service';
import { QuestionService } from 'src/question/question.service';
import { PlayerService } from 'src/player/player.service';
import { AnswerService } from 'src/answer/answer.service';

@Module({
  providers: [PrismaService, QuizzService, S3Service, RoomService, QuestionService, PlayerService, AnswerService]
})
export class QuizzModule {}
