import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { QuizzService } from 'src/quizz/quizz.service';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomService: RoomService,
    private readonly s3Service: S3Service,
  ) {}
  async create(data: CreateQuestionDto) {
    const question = await this.prisma.question.create({ data });

    const mediaCoverUrl = question.media_s3Key
      ? await this.s3Service.getSignedUrl(question.media_s3Key)
      : null;

    return { ...question, mediaCoverUrl };
  }
  async delete(id: number) {
    const question = await this.prisma.question.delete({
      where: { id },
    });
    if (question) {
      return { message: 'Question deleted succesfully.' };
    } else {
      return { message: "Question cloudn't be delete." };
    }
  }

  async findAll() {
    const questions = await this.prisma.question.findMany({
      include: {
        quizz: {
          select: { title: true }, // on ne prend que le titre
        },
      },
    });

    // On renomme `quizz.title` en `quizzName` pour simplifier le JSON
    return questions.map((q) => ({
      ...q,
      quizzName: q.quizz?.title || null,
      quizz: undefined, // on supprime le sous-objet pour épurer la réponse
    }));
  }

  async findAllNotDeleted() {
    const questions = await this.prisma.question.findMany({
      where: {
        isDeleted: false
      },
      include: {
        quizz: {
          select: { title: true }, // on ne prend que le titre
        },
      },
    });

    // On renomme `quizz.title` en `quizzName` pour simplifier le JSON
    return questions.map((q) => ({
      ...q,
      quizzName: q.quizz?.title || null,
      quizz: undefined, // on supprime le sous-objet pour épurer la réponse
    }));
  }

  async findById(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    const mediaCoverUrl = question.media_s3Key
      ? await this.s3Service.getSignedUrl(question.media_s3Key)
      : null;

    return { ...question, mediaCoverUrl };
  }

  async findByQuizzId(quizzId: number) {
    const questions = await this.prisma.question.findMany({
      where: { quizzId: quizzId, isDeleted: false },
      orderBy: {
        id: 'asc',   // 🔥 tri par id ASC
      },
    });

    if (!questions) {
      throw new NotFoundException(
        `Questions with quizzId ${quizzId} not found`,
      );
    }

    return Promise.all(
      questions.map(async (q) => ({
        ...q,
        mediaCoverUrl: q.media_s3Key
          ? await this.s3Service.getSignedUrl(q.media_s3Key)
          : null,
      })),
    );
  }

  async findCurrentQuestionByRoomCode(roomCode: string) {
    const room = await this.roomService.findAvailableByCode(roomCode)

    if (!room) {
      throw new NotFoundException(`Room with code ${roomCode} not found`);
    }

    if (room.currentQuestionId === null) {
      throw new NotFoundException(
        `Room with code ${roomCode} does not have a current question`,
      );
    }

    const question = await this.prisma.question.findUnique({
      where: { id: room.currentQuestionId },
    });

    if (!question) {
      throw new NotFoundException(
        `Questions with id ${room.currentQuestionId} not found`,
      );
    }

    const mediaCoverUrl = question.media_s3Key
      ? await this.s3Service.getSignedUrl(question.media_s3Key)
      : null;

    return { ...question, mediaCoverUrl };
  }

  // async findByRoomCode(roomCode: string) {
  //   const room = await this.roomService.findAvailableByCode(roomCode)
  //   const questions = await this.prisma.question.findMany({
  //     where: { quizzId: room.quizzId },
  //   });

  //   if (!questions) {
  //     throw new NotFoundException(`Questions not found for roomCode `);
  //   }

  //   const mediaCoverUrl = question.media_s3Key
  //     ? await this.s3Service.getSignedUrl(question.media_s3Key)
  //     : null;

  //   return { ...question, mediaCoverUrl };
  // }

  async update(id: number, data: CreateQuestionDto) {
    const question = await this.prisma.question.update({
      where: { id },
      data,
    });

    const mediaCoverUrl = question.media_s3Key
      ? await this.s3Service.getSignedUrl(question.media_s3Key)
      : null;

    if (question) {
      return { ...question, mediaCoverUrl };
    } else {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }
}
