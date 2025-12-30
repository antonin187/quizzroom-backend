import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PrismaService, AnswerService]
})
export class AnswerModule {}
