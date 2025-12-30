import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomHandler } from '../handlers/room.handler';
import { AuthService } from '../auth/auth.service';
import { RoomService } from '../room/room.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // pour tests
  },
})
export class AppGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly roomService: RoomService,
    private readonly roomHandler: RoomHandler,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * 3️⃣ Quand le client se connecte (connexion WebSocket ouverte)
   */
  async handleConnection(client: Socket) {
    console.log(`🔌 Client connecté : ${client.id}`);
    console.log('Handshake auth :', client.handshake.auth);
    if (client.handshake.auth?.player_token) {
      // C'est un player qui s'est connecté
      const token = client.handshake.auth?.player_token;
      try {
        const payload = this.authService.verifyPlayerToken(token);
        client.data = {
          playerId: payload.playerId,
          roomId: payload.roomId,
          pseudo: payload.pseudo,
          isAdmin: false,
        };
        console.log(`✅ ${payload.pseudo} connecté en player`);
      } catch (error) {
        console.warn('❌ Token invalide');
        client.disconnect(true);
      }
    } else if (client.handshake.auth?.access_token) {
      // C'est un admin qui s'est connecté
      const token = client.handshake.auth?.access_token;
      try {
        const payload = this.jwtService.verify(token);
        client.data = {
          email: payload.email,
          isAdmin: true,
        };
        console.log(`✅ ${payload.email} connecté en admin !`);
      } catch (error) {
        console.warn('❌ Token invalide');
        client.disconnect(true);
      }
    } else if (client.handshake.auth?.screen) {
      // C'est un écran qui s'est connecté
      client.data = {
        isScreen: true,
        roomCode: client.handshake.auth.roomCode,
      };
      console.log(`Un écran vient de se connecter !`);
    } else {
      console.warn('❌ Pas de token, on déconnecte le client');
      client.disconnect(true);
      return;
    }

    // const token = client.handshake.auth?.player_token;
    // if (!token) {
    //   console.warn('❌ Pas de token, on déconnecte le client');
    //   client.disconnect(true);
    //   return;
    // }
    // try {
    //   const payload = this.authService.verifyPlayerToken(token);
    //   client.data = {
    //     playerId: payload.playerId,
    //     roomId: payload.roomId,
    //     pseudo: payload.pseudo,
    //   };
    //   console.log(`✅ ${payload.pseudo} connecté à la room ${payload.roomId}`);
    // } catch (error) {
    //   console.warn('❌ Token invalide');
    //   client.disconnect(true);
    // }
  }

  /**
   * 4️⃣ Quand le client se déconnecte (ferme la page ou perd la co)
   */
  handleDisconnect(client: Socket) {
    console.log(`❌ Client déconnecté : ${client.id}`);
    this.roomHandler.leaveRoom(this.server, client);
  }

  /**
   * 1️⃣ Quand le client émet "joinRoom"
   */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomCode?: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.roomHandler.joinRoom(this.server, client, data);
  }

  /**
   * 2️⃣ Quand le client émet "leaveRoom"
   */
  @SubscribeMessage('startGame')
  startGame(@ConnectedSocket() client: Socket) {
    this.roomHandler.startGame(this.server, client);
  }

  /**
   * 2️⃣ Quand le client émet "leaveRoom"
   */
  @SubscribeMessage('moveToNextQuestion')
  moveToNextQuestion(@ConnectedSocket() client: Socket) {
    this.roomHandler.moveToNextQuestion(this.server, client);
  }

  /**
   * 2️⃣ Quand le client émet "leaveRoom"
   */
  @SubscribeMessage('sendResponse')
  receiveResponse(
    @MessageBody() data: { choiceIndex: number, choiceLabel: string, questionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.roomHandler.receiveResponse(this.server, client, data);
  }

  /**
   * 2️⃣ Quand l'admin client émet "checkTheAnswers"
   */
  @SubscribeMessage('checkTheAnswers')
  checkTheAnswers(@ConnectedSocket() client: Socket) {
    this.roomHandler.checkTheAnswers(this.server, client);
  }

  /**
   * 2️⃣ Quand l'admin client émet "checkTheAnswers"
   */
  @SubscribeMessage('endTheQuizz')
  endTheQuizz(@ConnectedSocket() client: Socket) {
    this.roomHandler.endTheQuizz(this.server, client);
  }

  /**
   * 2️⃣ Quand le client émet "leaveRoom"
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket) {
    this.roomHandler.leaveRoom(this.server, client);
  }
}
