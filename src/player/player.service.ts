import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { JoinRoomDto } from 'src/room/dto/join-room.dto';
import { Player } from 'generated/prisma';
import { AnswerService } from 'src/answer/answer.service';
import { QuestionService } from 'src/question/question.service';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly answerService: AnswerService,
  ) {}

  async create(data: JoinRoomDto) {
    return this.prisma.player.create({
      data: {
        pseudo: data.pseudo,
        room: {
          connect: { code: data.code.toUpperCase() },
        },
      },
    });
  }

  async delete(roomId: number, pseudo: string) {
    const result = await this.prisma.player.deleteMany({
      where: {
        roomId: roomId,
        pseudo: pseudo,
      },
    });

    if (result.count > 0) {
      return { message: 'Player deleted successfully.' };
    }
    return { message: "Player couldn't be deleted." };
  }

  async findByPseudoRoomId(pseudo: string, roomId: number) {
    const player = await this.prisma.player.findFirst({
      where: {
        pseudo: pseudo,
        roomId: roomId,
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }

  async findById(playerId: number) {
    const player = await this.prisma.player.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player) {
      throw new NotFoundException(
        "Aucun joueur n'a été trouvé pour l'id : " + player,
      );
    }

    return player;
  }

  async increaseScoreByPlayerId(playerId: number) {
    try {
      // Utilise un update direct avec increment pour éviter 2 accès DB
      const updatedPlayer = await this.prisma.player.update({
        where: { id: playerId },
        data: { score: { increment: 1 } },
      });
      return updatedPlayer;
    } catch (error) {
      throw error; // laisse la stack complète à l'appelant
    }
  }

  async findPlayerResults(
    playerId: number,
    roomId: number,
    questionId: number,
  ) {
    //  Answer, Question, Player
    try {
      const answer = await this.prisma.answer.findFirstOrThrow({
        where: {
          playerId: playerId,
          questionId: questionId,
          roomId: roomId,
        },
        include: {
          player: true,
          question: true,
        },
      });
      return {
        isCorrect: answer.isCorrect,
        chosenIndex: answer.chosenIndex,
        correctIndex: answer.question?.answerIndex,
        score: answer.player?.score,
        input: answer.input,
      };
    } catch (error) {
      throw error; // laisse la stack complète à l'appelant
    }
  }

  async findByRoomCode(playerId: number, roomId: number, questionId: number) {
    //  Answer, Question, Player
    try {
      const answer = await this.prisma.answer.findFirstOrThrow({
        where: {
          playerId: playerId,
          questionId: questionId,
          roomId: roomId,
        },
        include: {
          player: true,
          question: true,
        },
      });
      return {
        isCorrect: answer.isCorrect,
        chosenIndex: answer.chosenIndex,
        correctIndex: answer.question?.answerIndex,
        score: answer.player?.score,
      };
    } catch (error) {
      throw error; // laisse la stack complète à l'appelant
    }
  }

  async findByRoomId(roomId: number) {
    //  Answer, Question, Player
    try {
      const players = await this.prisma.player.findMany({
        where: {
          roomId: roomId,
        },
      });
      return players;
    } catch (error) {
      throw error; // laisse la stack complète à l'appelant
    }
  }

  async findConnectedByRoomId(roomId: number) {
    //  Answer, Question, Player
    try {
      const players = await this.prisma.player.findMany({
        where: {
          roomId: roomId,
          connected: true
        },
      });
      return players;
    } catch (error) {
      throw error; // laisse la stack complète à l'appelant
    }
  }
}
