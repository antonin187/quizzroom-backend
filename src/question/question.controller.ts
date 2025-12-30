import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PlayerAuthGuard } from 'src/auth/player-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async findAll() {
    return this.questionService.findAllNotDeleted();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.findById(id);
  }
  // @Get(':roomCode')
  // async findByRoomCode(@Param('roomCode') roomCode: string) {
  //   return this.questionService.findById(id);
  // }

  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    // Mettre à jour la question pour la marquer comme supprimée (soft delete)
    return this.questionService.update(id, { isDeleted: true } as any);
    // return this.questionService.delete(id); // ou simplement id si tu gardes string
  }

  @Put(':id')
  async put(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateQuestionDto) {
    return this.questionService.update(id, dto); // ou simplement id si tu gardes string
  }

  @Get('admin/currentQuestion')
  async getAdminCurrentQuestion(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateQuestionDto) {
    return this.questionService.update(id, dto); // ou simplement id si tu gardes string
  }

  @Get('result')
  async getQuestionResults(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateQuestionDto) {
    return this.questionService.update(id, dto); // ou simplement id si tu gardes string
  }
}
