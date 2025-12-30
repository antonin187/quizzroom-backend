import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus } from './enums/room-status.enum';
import { PlayerService } from 'src/player/player.service';
import { AnswerService } from 'src/answer/answer.service';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playerService: PlayerService,
    private readonly answerService: AnswerService,
  ) {}

  async findAll() {
    const rooms = await this.prisma.room.findMany({
      include: {
        quizz: {
          select: { title: true }, // on ne prend que le titre
        },
      },
    });

    return rooms.map((room) => ({
      ...room,
      quizzName: room.quizz.title,
      quizz: undefined,
    }));
  }

  async findByCode(code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: {
        quizz: {
          select: { title: true }, // on ne prend que le titre
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`No room found with "${code}"`);
    }
    return {
      ...room,
      quizzName: room.quizz.title,
      quizz: undefined,
    };
  }

  async findAvailableByCode(code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code: code, status: RoomStatus.AVAILABLE },
      include: {
        quizz: {
          select: { title: true }, // on ne prend que le titre
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`No room found with "${code}"`);
    }
    return {
      ...room,
      quizzName: room.quizz.title,
      quizz: undefined,
    };
  }
  async findAvailableById(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id: id, status: RoomStatus.AVAILABLE },
      include: {
        quizz: {
          select: { title: true }, // on ne prend que le titre
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`No room found with "${id}"`);
    }
    return {
      ...room,
      quizzName: room.quizz.title,
      quizz: undefined,
    };
  }

  async findPlayersInTheRoomById(id: number) {
    const players = await this.prisma.player.findMany({
      where: {
        roomId: id,
        connected: true,
      },
    });

    if (!players) {
      throw new NotFoundException(
        `No players found for room with id : "${id}"`,
      );
    }
    return players;
  }

  async create(data: CreateRoomDto) {
    const generatedCode = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();

    let generatedCodeString: string;
    let existing: any;

    do {
      generatedCodeString = generatedCode();
      existing = await this.prisma.room.findUnique({
        where: { code: generatedCodeString },
      });
    } while (existing);

    try {
      const room = await this.prisma.room.create({
        data: {
          ...data,
          status: RoomStatus.AVAILABLE,
          code: generatedCodeString,
        },
      });

      return room;
    } catch (error) {
      throw new Error('Room could not be created : ' + error);
    }
  }

  async delete(id: number) {
    const room = await this.prisma.room.delete({
      where: { id },
    });
    if (room) {
      return { message: 'Room deleted successfully.' };
    } else {
      return { message: "Room couldn't be deleted." };
    }
  }
  /**
   * Met à jour la question courante (currentQuestion) de la room.
   * @param id L'id de la room à mettre à jour
   * @param questionId L'id de la nouvelle question courante (doit exister dans la table Question)
   */
  async updateCurrentQuestion(id: number, questionId: number) {
    // Ici on suppose que la room possède un champ currentQuestion qui est une clé étrangère vers Question (relation)
    const room = await this.prisma.room.update({
      where: { id },
      data: {
        currentQuestion: {
          connect: { id: questionId },
        },
      },
    });
    if (room) {
      return { message: 'Current question updated successfully.', room };
    } else {
      return { message: "Room couldn't be updated." };
    }
  }

  /**
   * Met à jour la question courante (currentQuestion) de la room.
   * @param id L'id de la room à mettre à jour
   * @param questionId L'id de la nouvelle question courante (doit exister dans la table Question)
   */
  async currentQuestionIdByRoomId(roomId) {
    // Ici on suppose que la room possède un champ currentQuestion qui est une clé étrangère vers Question (relation)
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    if (room) {
      return room.currentQuestionId;
    } else {
      return { message: "Room couldn't be found." };
    }
  }

  /**
   * Met à jour la question courante (currentQuestion) de la room.
   * @param id L'id de la room à mettre à jour
   * @param questionId L'id de la nouvelle question courante (doit exister dans la table Question)
   */
  async currentQuestionByRoomId(roomId) {
    // Ici on suppose que la room possède un champ currentQuestion qui est une clé étrangère vers Question (relation)
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    const question = await this.prisma.question.findUnique({
      where: { id: room?.currentQuestionId ?? undefined },
    });
    if (room && question) {
      return question;
    } else {
      return { message: "Room couldn't be found." };
    }
  }

  async getResults(roomId: number, playerId: number) {
    try {
      const players = await this.playerService.findConnectedByRoomId(roomId);

      // Classement des joueurs [psuedo + id + score]
      // Podium

      // On trie les joueurs par score décroissant, puis on ne garde que l'id, le pseudo et le score
      // Nous devons attribuer un rang à chaque joueur selon leur score, les ex-aequo ayant le même rang.
      const sorted = players.sort((a, b) => b.score - a.score);
      let prevScore: number | null = null;
      let rank = 0;
      let sameRankCount = 0;
      const classement = sorted.map(({ id, pseudo, score }, index) => {
        if (score !== prevScore) {
          rank = index + 1;
          prevScore = score;
          sameRankCount = 1;
        } else {
          sameRankCount++;
        }
        return { id, pseudo, score, rang: rank };
      });

      // Pour ajouter un élément dans un tableau en JavaScript (ici TypeScript), on peut utiliser la méthode push()
      // Exemple : yourArray.push(nouvelElement);
      let yourself = classement.find((player) => player.id === playerId);
      // Par exemple, si vous voulez ajouter une propriété rank à l'objet yourself, il suffit de l'assigner :

      if (!yourself) {
        throw new NotFoundException(
          "Your token player doesn't match with players",
        );
      }

      // Ici, on utilise le rang (rank) pour trouver le ou les premiers (tous ceux qui sont classés 1er)
      const firstPlace = classement.filter((player) => player.rang === 1);
      const secondPlace = classement.filter((player) => player.rang === 2);
      const thirdPlace = classement.filter((player) => player.rang === 3);

      // Retourner les réponses du joueur
      const yourselfAnswers = await this.answerService.findAllByPlayerId(
        yourself.id,
      );
      if (!yourselfAnswers || yourselfAnswers.length === 0) {
        throw new NotFoundException(
          'No answers found for player with id : ' + yourself.id,
        );
      }

      return {
        classement,
        firstPlace,
        secondPlace,
        thirdPlace,
        yourself,
        yourselfAnswers,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error; // ❗️ garder les erreurs Nest
      throw new InternalServerErrorException('Error while fetching results');
    }
  }
}
