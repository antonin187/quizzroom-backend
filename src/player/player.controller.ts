import { Controller, Get, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { AnswerService } from 'src/answer/answer.service';
import { PlayerAuthGuard } from 'src/auth/player-auth.guard';
import { QuestionService } from 'src/question/question.service';
import { PlayerService } from './player.service';

@UseGuards(PlayerAuthGuard)
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('/result')
  getPlayerResults(
    @Query("questionId", ParseIntPipe) questionId: number,
    @Req() req) {
        const { playerId, roomId } = req.user;
    return this.playerService.findPlayerResults(playerId, roomId, questionId);
  }
}
