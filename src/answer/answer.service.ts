import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { FindByQuestionIdAndRoomIdDto } from './dto/find.dto';
import { PlayerService } from 'src/player/player.service';
import { QuestionService } from 'src/question/question.service';

@Injectable()
export class AnswerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAnswerDto) {
    try {
      const answer = await this.prisma.answer.create({
        data: {
          chosenIndex: data.chosenIndex,
          player: data.playerId
            ? { connect: { id: data.playerId } }
            : undefined,
          question: data.questionId
            ? { connect: { id: data.questionId } }
            : undefined,
          room: data.roomId ? { connect: { id: data.roomId } } : undefined,
          isCorrect: data.isCorrect
        },
      });
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  // Pour ne récupérer que les answers dont le player (utilisateur) est connecté,
  // on suppose qu'il y a un champ `isConnected` sur le modèle Player.
  // On ajoute une clause dans le filtre Prisma via la clé `player: { isConnected: true }`.
  async findAllByQuestionIdAndRoomId(questionId: number, roomId: number) {

    console.log(`{ questionId, roomId } = { ${questionId}, ${roomId} }`)
    try {
      const answers = await this.prisma.answer.findMany({
        where: {
          questionId: questionId,
          roomId: roomId,
          player: {
            connected: true,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          player: true, // Inclut tout l'objet player lié
          question: true, // Inclut tout l'objet question lié
          room: true, // Inclut tout l'objet room lié
        },
      });
      return answers;
    } catch (error) {
      console.error('Error finding answers:', error);
      throw error;
    }
  }

  async findById(answerId: number) {
    const answer = await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    });

    if (!answer) {
      throw new NotFoundException(
        "Aucune question trouvée pour l'id : " + answerId,
      );
    }

    return answer;
  }

  async findAllByPlayerId(playerId: number) {
    const answer = await this.prisma.answer.findMany({
      where: {
        playerId: playerId,
      },
      include: {
        question: true
      }
    });

    if (!answer) {
      throw new NotFoundException(
        "Aucune question trouvée pour le joueur ayant pou id : " + playerId,
      );
    }

    return answer;
  }
}
