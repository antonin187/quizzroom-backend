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
import { AppGateway } from './gateways/app.gateway';
import { RoomHandler } from './handlers/room.handler';
import { RoomController } from './room/room.controller';
import { RoomModule } from './room/room.module';
import { RoomService } from './room/room.service';
import { PlayerService } from './player/player.service';
import { GameController } from './game/game.controller';
import { GameModule } from './game/game.module';
import { QuestionFreeController } from './question/question-free.controller';
import { AnswerController } from './answer/answer.controller';
import { AnswerModule } from './answer/answer.module';
import { AnswerService } from './answer/answer.service';
import { PlayerController } from './player/player.controller';
import { PlayerModule } from './player/player.module';
import { RoomPlayerController } from './room/room-player.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    QuizzModule,
    S3Module,
    QuestionModule,
    RoomModule,
    GameModule,
    AnswerModule,
    PlayerModule,
  ],
  controllers: [
    AppController,
    QuizzController,
    QuestionController,
    QuestionFreeController,
    RoomController,
    RoomPlayerController,
    GameController,
    AnswerController,
    PlayerController,
  ],
  providers: [
    RoomService,
    QuestionService,
    QuizzService,
    AppService,
    PrismaService,
    AppGateway,
    RoomHandler,
    PlayerService,
    AnswerService
  ],
})
export class AppModule {}
