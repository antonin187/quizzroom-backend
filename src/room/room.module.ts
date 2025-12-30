import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma.service';
import { PlayerService } from 'src/player/player.service';
import { AnswerService } from 'src/answer/answer.service';

@Module({
  providers: [RoomService, PrismaService, PlayerService, AnswerService],
})
export class RoomModule {}
