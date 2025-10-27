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
import { AppGateway } from './app.gateway';
import { RoomHandler } from './handlers/room.handler';
import { RoomController } from './room/room.controller';
import { RoomModule } from './room/room.module';
import { RoomService } from './room/room.service';

@Module({
  imports: [AuthModule, UsersModule, QuizzModule, S3Module, QuestionModule, RoomModule],
  controllers: [AppController, QuizzController, QuestionController, RoomController],
  providers: [RoomService, QuestionService, QuizzService, AppService, PrismaService, AppGateway, RoomHandler],
})
export class AppModule {}
