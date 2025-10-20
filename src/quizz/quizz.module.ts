import { Module } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
  providers: [PrismaService, QuizzService, S3Service]
})
export class QuizzModule {}
