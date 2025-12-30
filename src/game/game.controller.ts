import { Controller } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Controller('game')
export class GameController {
    constructor(private readonly prismaService: PrismaService) {}
}
