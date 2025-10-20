import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { S3Service } from 'src/s3/s3.service';

@UseGuards(JwtAuthGuard)
@Controller('quizz')
export class QuizzController {
  constructor(
    private readonly quizzService: QuizzService,
    private readonly s3Service: S3Service, // Ajout de 'private readonly' pour que s3Service soit une propriété de la classe
  ) {}

  @Post()
  async create(@Body() dto: CreateQuizzDto) {
    return this.quizzService.create(dto);
  }

  // ✅ NOUVEL ENDPOINT pour obtenir une URL signée PUT
//   @Get('upload/url')
//   async getUploadUrl(
//     @Query('key') key: string,
//     @Query('contentType') contentType: string,
//   ) {
//     return this.quizzService.getUploadUrl(key, contentType);
//   }

  @Get()
  async findAll() {
    return this.quizzService.findAll();
  }
}
