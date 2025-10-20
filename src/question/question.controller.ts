import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';

@UseGuards(JwtAuthGuard)
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async findAll() {
    return this.questionService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.delete(id); // ou simplement id si tu gardes string
  }

  @Put(':id')
  async put(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateQuestionDto) {
    return this.questionService.update(id, dto); // ou simplement id si tu gardes string
  }
}
