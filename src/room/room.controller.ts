import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';

@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async findAll() {
    return this.roomService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateRoomDto) {
    return this.roomService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.delete(id); // ou simplement id si tu gardes string
  }
}
