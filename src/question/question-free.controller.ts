import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PlayerAuthGuard } from 'src/auth/player-auth.guard';
import { CurrentQuestionDto } from './dto/current-question.dto';

@Controller('question')
export class QuestionFreeController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('/free/currentQuestion')
  getPlayerCurrentQuestion(@Query() query: CurrentQuestionDto) {
    // Récupère la question actuelle de la room où il joue
    return this.questionService.findCurrentQuestionByRoomCode(query.roomCode);
  }
}
