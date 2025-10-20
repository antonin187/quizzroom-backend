import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PrismaService, UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
