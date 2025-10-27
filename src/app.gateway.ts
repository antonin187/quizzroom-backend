import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { RoomHandler } from './handlers/room.handler';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // pour tests
    },
  })
  export class AppGateway {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly roomHandler: RoomHandler) {}
  
    /**
     * 1️⃣ Quand le client émet "joinRoom"
     */
    @SubscribeMessage('joinRoom')
    handleJoinRoom(
      @MessageBody() data: { roomId: string; username: string },
      @ConnectedSocket() client: Socket,
    ) {
      this.roomHandler.joinRoom(this.server, client, data);
    }
  
    /**
     * 2️⃣ Quand le client émet "leaveRoom"
     */
    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@ConnectedSocket() client: Socket) {
      this.roomHandler.leaveRoom(this.server, client);
    }
  
    /**
     * 3️⃣ Quand le client se connecte (connexion WebSocket ouverte)
     */
    handleConnection(client: Socket) {
      console.log(`🔌 Client connecté : ${client.id}`);
    }
  
    /**
     * 4️⃣ Quand le client se déconnecte (ferme la page ou perd la co)
     */
    handleDisconnect(client: Socket) {
      console.log(`❌ Client déconnecté : ${client.id}`);
      this.roomHandler.leaveRoom(this.server, client);
    }
  }
  