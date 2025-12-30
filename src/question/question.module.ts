import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { RoomService } from 'src/room/room.service';
import { PlayerService } from 'src/player/player.service';
import { AnswerService } from 'src/answer/answer.service';

@Module({
  providers: [PrismaService, S3Service, QuestionService, RoomService, PlayerService, AnswerService]
})
export class QuestionModule {}
