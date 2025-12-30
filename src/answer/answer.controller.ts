import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AnswerService } from './answer.service';
import { FindByQuestionIdAndRoomIdDto } from './dto/find.dto';
import { RoomService } from 'src/room/room.service';
import { CorrectAnswerDto } from './dto/correct-answer.dto';
import { PlayerService } from 'src/player/player.service';
import { Answer } from 'generated/prisma';

@UseGuards(JwtAuthGuard)
@Controller('answer')
export class AnswerController {
  constructor(
    private readonly answerService: AnswerService,
    private readonly roomService: RoomService,
    private readonly playerService: PlayerService,
  ) {}
  @Get('findAllByQuestionIdAndRoomCode')
  async findAllByQuestionIdAndRoomCode(
    @Query() query: FindByQuestionIdAndRoomIdDto,
  ) {
    const { questionId, roomCode } = query;
    console.log(`{ questionId, roomCode } = { ${questionId}, ${roomCode} }`);
    const room = await this.roomService.findAvailableByCode(roomCode);
    if (!room) {
      console.log('No available room found with this code.');
      throw new NotFoundException('No available room found with this code');
    }
    const answers = await this.answerService.findAllByQuestionIdAndRoomId(
      questionId,
      room.id,
    );
    if (!answers || answers.length === 0) {
      console.log('No answers found.');
      throw new NotFoundException('No answers found.');
    }
    return answers;
  }

  @Put('setAnswersToCorrect')
  async setAnswersToCorrect(@Body() answers: Answer[]) {
    if (!Array.isArray(answers)) {
      throw new BadRequestException('Answers must be an array');
    }

    if (answers.length === 0) {
      // 👇 règle métier : rien à valider
      return [];
    }
    const updatedAnswers: Answer[] = [];

    for (const answer of answers) {
      const updated = await this.answerService.updateIsCorrect(answer.id, true);

      await this.playerService.increaseScoreByPlayerId(answer.playerId);

      updatedAnswers.push(updated);
    }

    return updatedAnswers;
  }
}
