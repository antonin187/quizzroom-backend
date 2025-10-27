import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  username: string;
}

interface Room {
  id: string;
  players: Player[];
  isStarted: boolean;
}

@Injectable()
export class RoomHandler {
  private readonly logger = new Logger(RoomHandler.name);
  private rooms: Map<string, Room> = new Map();

  /**
   * Un joueur rejoint une room
   */
  joinRoom(server: Server, client: Socket, data: { roomId: string; username: string }) {
    const { roomId, username } = data;

    let room = this.rooms.get(roomId);
    if (!room) {
      room = { id: roomId, players: [], isStarted: false };
      this.rooms.set(roomId, room);
      this.logger.log(`Création de la room ${roomId}`);
    }

    // Vérifie si le joueur est déjà dans la room
    const alreadyIn = room.players.find((p) => p.id === client.id);
    if (!alreadyIn) {
      room.players.push({ id: client.id, username });
      client.join(roomId);
      this.logger.log(`${username} a rejoint la room ${roomId}`);
    }

    // Notifie tous les joueurs de la room
    server.to(roomId).emit('playerJoined', {
      roomId,
      username,
      players: room.players.map((p) => p.username),
    });

    // Retourne l’état actuel de la room au joueur
    client.emit('roomJoined', {
      roomId,
      players: room.players.map((p) => p.username),
    });
  }

  /**
   * Un joueur quitte la room (déconnexion ou bouton "Quitter")
   */
  leaveRoom(server: Server, client: Socket) {
    for (const [roomId, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.id === client.id);
      if (playerIndex !== -1) {
        const [player] = room.players.splice(playerIndex, 1);
        client.leave(roomId);

        this.logger.log(`${player.username} a quitté la room ${roomId}`);
        server.to(roomId).emit('playerLeft', { username: player.username });

        // Si la room est vide, on la supprime
        if (room.players.length === 0) {
          this.rooms.delete(roomId);
          this.logger.log(`Suppression de la room ${roomId} (vide)`);
        }

        break;
      }
    }
  }

  /**
   * Récupère l’état d’une room
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Récupère la liste de toutes les rooms
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Supprime une room (admin ou fin de partie)
   */
  deleteRoom(server: Server, roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      this.rooms.delete(roomId);
      server.to(roomId).emit('roomDeleted', { roomId });
      this.logger.warn(`Room ${roomId} supprimée`);
    }
  }
}
