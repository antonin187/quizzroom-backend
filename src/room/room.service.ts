import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus } from './enums/room-status.enum';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

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
      quizz: undefined
    }))
  }

  async create(data: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: {
        ...data,
        status: RoomStatus.AVAILABLE,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    });

    if (!room) {
      throw new Error('Room could not be created');
    }
    return room;
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
}
