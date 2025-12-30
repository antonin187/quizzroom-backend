import { Injectable } from '@nestjs/common';
import { Quizz } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { RoomService } from 'src/room/room.service';
import { QuestionService } from 'src/question/question.service';

@Injectable()
export class QuizzService {
  constructor(
    private prisma: PrismaService,
    private questionService: QuestionService,
    private roomService: RoomService,
    private s3Service: S3Service,
  ) {}

   // ✅ Nouvelle méthode
//    async getUploadUrl(key: string, contentType: string) {
//     const uploadUrl = await this.s3Service.getUploadUrl(key, contentType);
//     return { uploadUrl };
//   }
  


  async create(data: CreateQuizzDto) {
    // Enregistre le quizz
    const quizz = await this.prisma.quizz.create({ data });

    // Génère l’URL signée si une cover est présente
    const coverUrl = quizz.s3Key
      ? await this.s3Service.getSignedUrl(quizz.s3Key)
      : null;

    return { ...quizz, coverUrl };
  }

  async findAll() {
    const list = await this.prisma.quizz.findMany();

    return Promise.all(
      list.map(async (q) => ({
        ...q,
        coverUrl: q.s3Key ? await this.s3Service.getSignedUrl(q.s3Key) : null,
      })),
    );
  }

  async findById(id: number) {
    const quizz = await this.prisma.quizz.findUnique({
      where: { id }
    });

    if (!quizz) return null;

    const coverUrl = quizz.s3Key ? await this.s3Service.getSignedUrl(quizz.s3Key) : null;

    return { ...quizz, coverUrl };
  }

  async findByRoomCode(roomCode: string) {
    const room = await this.roomService.findAvailableByCode(roomCode);
    const quizz = await this.prisma.quizz.findUnique({
      where: { id: room.quizzId }
    });

    if (!quizz) return null;

    const questions = await this.questionService.findByQuizzId(quizz.id)

    if (!questions) return null;

    const coverUrl = quizz.s3Key ? await this.s3Service.getSignedUrl(quizz.s3Key) : null;

    return { ...quizz, coverUrl, questions };
  }
  async findByRoomId(roomId: number) {
    const room = await this.roomService.findAvailableById(roomId);
    const quizz = await this.prisma.quizz.findUnique({
      where: { id: room.quizzId }
    });

    if (!quizz) return null;

    const questions = await this.questionService.findByQuizzId(quizz.id)

    if (!questions) return null;

    const coverUrl = quizz.s3Key ? await this.s3Service.getSignedUrl(quizz.s3Key) : null;

    return { ...quizz, coverUrl, questions };
  }
}
