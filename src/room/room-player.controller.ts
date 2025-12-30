import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { PlayerService } from 'src/player/player.service';
import { CreatePlayerDto } from 'src/player/dto/create-player.dto';
import { AuthService } from 'src/auth/auth.service';
import type { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { PrismaService } from 'src/prisma.service';
import { RoomStatus } from './enums/room-status.enum';
import { PlayerAuthGuard } from 'src/auth/player-auth.guard';
import { ResultsRoomDto } from './dto/results-room.dto';

@UseGuards(PlayerAuthGuard)
@Controller('roomPlayer')
export class RoomPlayerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomService: RoomService,
    private readonly playerService: PlayerService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async findAll() {
    return this.roomService.findAll();
  }

  @Get('results')
  findPlayersInRoomById(
    @Req() req // permet de récupérer req.user injecté par PlayerAuthGuard
  ) {
    const { playerId, roomId } = req.user;
    return this.roomService.getResults(
      parseInt(roomId),
      parseInt(playerId)
    );
  }

  // @Get(':code')
  // async findByCode(@Param('code') code: string) {
  //   return this.roomService.findByCode(code);
  // }

  // @Post()
  // async create(@Body() dto: CreateRoomDto) {
  //   return this.roomService.create(dto);
  // }

  // @Delete(':id')
  // async delete(@Param('id', ParseIntPipe) id: number) {
  //   return this.roomService.delete(id); // ou simplement id si tu gardes string
  // }

  // @Public()
  // @Post('join')
  // async joinRoom(
  //   @Body() dto: JoinRoomDto,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   try {
  //     if (dto.player_token) { // Si on a un player_token, ça veut dire qu'on s'est déjà connecté une fois
  //       const payload = this.authService.verifyPlayerToken(dto.player_token);
  //       const roomFromPayload = await this.roomService.findAvailableById(
  //         parseInt(payload.roomId),
  //       );
  //       // On veut savoir si ce qu'on a fourni au formulaire correspond aux valeurs qu'on a dans la payload
  //       if (
  //         dto.code === roomFromPayload?.code.toLowerCase() &&
  //         dto.pseudo === payload.pseudo
  //       ) {
  //         // Alors on est bien sur une reconexion, je passe le joeur en connected
  //         await this.prisma.player.updateMany({
  //           where: {
  //             id: Number(payload.playerId),
  //           },
  //           data: {
  //             connected: true,
  //           },
  //         });
  //         console.log("=== RECONNECT ===")
  //         return {
  //           room: roomFromPayload.code,
  //           quizz: roomFromPayload.quizzName,
  //           player: payload.pseudo,
  //           player_token: dto.player_token,
  //         };
  //       }
  //     }

  //     console.log("dto.code.toUpperCase() : " + dto.code.toUpperCase())

  //     const room = await this.roomService.findAvailableByCode(
  //       dto.code.toUpperCase(),
  //     );
  //     const player = await this.playerService.create(dto);

  //     const { player_token } =
  //       await this.authService.generatePlayertoken(player);

  //       // TODO : Le cookie ne sera plus utilisé
  //     res.cookie('player_token', player_token, {
  //       httpOnly: true, // ❌ pas accessible par JS
  //       secure: process.env.NODE_ENV === 'production', // ✅ seulement HTTPS
  //       sameSite: 'strict',
  //       maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
  //     });

  //     console.log("=== CONNECT ===")
  //     return {
  //       room: room.code,
  //       quizz: room.quizzName,
  //       player: player.pseudo,
  //       player_token: player_token,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
