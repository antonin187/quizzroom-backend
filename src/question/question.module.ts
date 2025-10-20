import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
  providers: [PrismaService, S3Service, QuestionService]
})
export class QuestionModule {}
