import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuizzController } from './quizz/quizz.controller';
import { QuizzModule } from './quizz/quizz.module';
import { QuizzService } from './quizz/quizz.service';
import { S3Module } from './s3/s3.module';
import { QuestionController } from './question/question.controller';
import { QuestionModule } from './question/question.module';
import { QuestionService } from './question/question.service';

@Module({
  imports: [AuthModule, UsersModule, QuizzModule, S3Module, QuestionModule],
  controllers: [AppController, QuizzController, QuestionController],
  providers: [QuestionService, QuizzService, AppService, PrismaService],
})
export class AppModule {}
