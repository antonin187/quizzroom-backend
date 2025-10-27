import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [RoomService, PrismaService],
})
export class RoomModule {}
