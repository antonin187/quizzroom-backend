import { Injectable } from '@nestjs/common';
import { Quizz } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';

@Injectable()
export class QuizzService {
  constructor(
    private prisma: PrismaService,
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
}
