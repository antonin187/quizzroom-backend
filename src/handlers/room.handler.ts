import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AnswerService } from 'src/answer/answer.service';
import { PlayerService } from 'src/player/player.service';
import { PrismaService } from 'src/prisma.service';
import { QuestionService } from 'src/question/question.service';
import { QuizzService } from 'src/quizz/quizz.service';
import { RoomStatus } from 'src/room/enums/room-status.enum';
import { RoomService } from 'src/room/room.service';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly roomService: RoomService,
    private readonly quizzService: QuizzService,
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
    private readonly playerService: PlayerService,
  ) {}

  /**
   * Un joueur rejoint une room
   */
  async joinRoom(server: Server, client: Socket, data: { roomCode?: string }) {
    const isAdmin = client.data.isAdmin;
    const isScreen = client.data.isScreen;

    console.log('isAdmin : ' + isAdmin);
    console.log('isScreen : ' + isScreen);

    console.log('!isAdmin  = ' + !isAdmin);
    console.log('!isScreen = ' + !isScreen);

    if (!isAdmin && !isScreen) {
      // C'est un joueur
      const { roomId, pseudo } = client.data;
      if (!roomId) return;

      try {
        await this.prisma.player.update({
          where: {
            id: client.data.playerId,
          },
          data: {
            socketId: client.id,
          },
        });
      } catch (error) {
        return;
      }

      client.join('room_' + roomId);

      console.log(`✅ ${pseudo} connecté à la room ${roomId}`);

      // notifier les autres joueurs de la room
      server.to(`room_${roomId}`).emit('playerJoined', {
        username: pseudo,
      });
      server.to(`admin_${roomId}`).emit('playerJoined', {
        username: pseudo,
      });

      const playersInTheRoom = await this.roomService.findPlayersInTheRoomById(
        parseInt(roomId),
      );

      // Dire au joueur qu'il a bien rejoint la room
      client.emit('roomJoined', {
        roomId,
        players: playersInTheRoom.map((player) => player.pseudo),
      });
    } else if (isAdmin) {
      // C'est un admin
      const room = await this.roomService.findAvailableByCode(data.roomCode!);
      if (!room.id) {
        return;
      }
      client.join('admin_' + room.id);
      client.data.roomId = room.id;

      const playersInTheRoom = await this.roomService.findPlayersInTheRoomById(
        room.id,
      );
      client.emit(
        'playerListUpdated',
        playersInTheRoom.map((player) => player.pseudo),
      );
    } else {
      // C'est un écran
      const room = await this.roomService.findAvailableByCode(data.roomCode!);
      if (!room.id) {
        return;
      }
      client.join('screen_' + room.id);
      client.data.roomId = room.id;
    }
  }

  /**
   * Un joueur quitte la room (déconnexion ou bouton "Quitter")
   */
  async leaveRoom(server: Server, client: Socket) {
    const { roomId, pseudo } = client.data;
    if (!roomId || !pseudo) return;

    console.log(`❌ ${pseudo} a quitté la room ${roomId}`);

    // Retirer la socket de la room
    client.leave(roomId);

    // Notifie tous les autres
    server.to('room_' + roomId).emit('playerLeft', { pseudo });
    server.to('admin_' + roomId).emit('playerLeft', { pseudo });

    // Optionnel : mettre à jour la BDD
    //await this.playerService.delete(roomId, pseudo);

    // On passe le player en disconnected
    await this.prisma.player.updateMany({
      where: {
        roomId: parseInt(roomId),
        pseudo: pseudo,
      },
      data: {
        connected: false,
      },
    });
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

  async startGame(server: Server, client: Socket) {
    try {
      const roomId = client.data?.roomId;
      if (!roomId) {
        console.log('❌ Aucune roomId trouvée pour ce client.');
        // client.emit('error', { message: 'Aucune roomId trouvée pour ce client.' });
        return;
      }

      server.to('room_' + roomId).emit('gameStarted');
      server.to('admin_' + roomId).emit('gameStarted');
      server.to('screen_' + roomId).emit('gameStarted');

      // Récupérer le quizz associé à la room
      const quizz = await this.quizzService.findByRoomId(roomId);
      if (!quizz) {
        console.log(
          "❌ Aucun quizz n'a été trouvé pour cette room. Impossible de démarrer la partie.",
        );
        //client.emit('error', { message: "Aucun quizz n'a été trouvé pour cette room. Impossible de démarrer la partie." });
        return;
      }

      if (!quizz.questions || quizz.questions.length === 0) {
        client.emit('error', {
          message:
            'Aucune question disponible pour ce quizz. Impossible de démarrer la partie.',
        });
        return;
      }

      const firstQuestion = quizz.questions[0];
      if (!firstQuestion?.id) {
        console.log(
          "❌ La première question du quizz est invalide ou ne possède pas d'identifiant.",
        );
        //client.emit('error', { message: "La première question du quizz est invalide ou ne possède pas d'identifiant." });
        return;
      }

      // Mettre à jour la current question dans la room
      try {
        await this.roomService.updateCurrentQuestion(roomId, firstQuestion.id);
      } catch (updateError) {
        console.log(
          '❌ Erreur lors de la mise à jour de la question courante.',
        );
        // client.emit('error', { message: 'Erreur lors de la mise à jour de la question courante.', details: updateError.message });
        return;
      }

      // Passer la room en occupied mais nécessite de revoir les appels api qui vérifie si la room est en available
      // await this.prisma.room.update({
      //   where: {
      //     id: roomId,
      //   },
      //   data: {
      //     status: RoomStatus.OCCUPIED,
      //   },
      // });

      // Envoyer le message de nextQuestion aux différents fronts concernés
      server.to('room_' + roomId).emit('nextQuestion');
      server.to('admin_' + roomId).emit('nextQuestion');
      server.to('screen_' + roomId).emit('nextQuestion');
    } catch (error) {
      console.error('Erreur dans startGame:', error);
      client.emit('error', {
        message: 'Erreur interne lors du démarrage de la partie.',
        details: error.message,
      });
    }
  }

  async moveToNextQuestion(server: Server, client: Socket) {
    try {
      const roomId = client.data?.roomId;
      const currentQuestionId =
        await this.roomService.currentQuestionIdByRoomId(roomId);
      if (!roomId) {
        console.log('❌ Aucune roomId trouvée pour cet admin.');
        // client.emit('error', { message: 'Aucune roomId trouvée pour ce client.' });
        return;
      }
      // Récupérer le quizz associé à la room
      const quizz = await this.quizzService.findByRoomId(roomId);
      if (!quizz) {
        console.log(
          "❌ Aucun quizz n'a été trouvé pour cette room. Impossible de démarrer la partie.",
        );
        //client.emit('error', { message: "Aucun quizz n'a été trouvé pour cette room. Impossible de démarrer la partie." });
        return;
      }

      // Récupérer le quizz associé à la room
      if (!quizz) {
        console.log(
          "❌ Aucun quizz n'a été trouvé pour cette room. Impossible de démarrer la partie.",
        );
        //client.emit('error', { message: "Aucun quizz n'a été trouvé pour cette room. Impossible de démarrer la partie." });
        return;
      }

      if (!quizz.questions || quizz.questions.length === 0) {
        client.emit('error', {
          message:
            'Aucune question disponible pour ce quizz. Impossible de démarrer la partie.',
        });
        return;
      }

      // Trouve la position actuelle
      const currentIndex = quizz.questions.findIndex(
        (q) => q.id === currentQuestionId,
      );

      // Calcul de la question suivante
      // Pour savoir si on n'est pas à la dernière question,
      // il suffit de vérifier que l'index actuel + 1 est inférieur à la longueur du tableau des questions
      let isLastQuestion = true;
      const nextQuestion = quizz.questions[currentIndex + 1];

      // Si c'est pas la dernière question
      if (currentIndex + 1 < quizz.questions.length - 1) {
        isLastQuestion = false;
      }

      console.log('isLastQuestion : ' + isLastQuestion);

      if (!nextQuestion?.id) {
        console.log(
          "❌ La question suivante du quizz est invalide ou ne possède pas d'identifiant.",
        );
        //client.emit('error', { message: "La première question du quizz est invalide ou ne possède pas d'identifiant." });
        return;
      }

      // Mettre à jour la current question dans la room
      try {
        await this.roomService.updateCurrentQuestion(roomId, nextQuestion.id);
        console.log('❌ tié où?.');
      } catch (updateError) {
        console.log(
          '❌ Erreur lors de la mise à jour de la question courante.',
        );
        // client.emit('error', { message: 'Erreur lors de la mise à jour de la question courante.', details: updateError.message });
        return;
      }

      // Envoyer le message de nextQuestion aux différents fronts concernés
      server.to('room_' + roomId).emit('nextQuestion');
      server.to('admin_' + roomId).emit('nextQuestion', { isLastQuestion });
      server.to('screen_' + roomId).emit('nextQuestion');
    } catch (error) {
      console.error('Erreur dans startGame:', error);
      client.emit('error', {
        message: 'Erreur interne lors du démarrage de la partie.',
        details: error.message,
      });
    }
  }

  async receiveResponse(
    server: Server,
    client: Socket,
    data: { choiceIndex: number; choiceLabel: string; questionId: number },
  ) {
    const { roomId, pseudo } = client.data;
    console.log('data ' + pseudo);
    console.log(data);
    const responseReceived = {
      pseudo: pseudo,
      ...data,
    };

    const player = await this.playerService.findByPseudoRoomId(pseudo, roomId);

    const question = await this.questionService.findById(data.questionId);

    if (!player && !question) {
      return;
    }

    console.log(
      `choiceIndex: ${data.choiceIndex} / choiceLabel: ${data.choiceLabel} / questionId: ${data.questionId}`,
    );
    console.log(`question: ${question.answerIndex}`);
    console.log('data.choiceIndex === question.answerIndex :');
    console.log(data.choiceIndex === question.answerIndex);

    const isResponseCorrect = data.choiceIndex === question.answerIndex;

    console.log('isResponseCorrect : ' + isResponseCorrect);

    const answer = await this.answerService.create({
      chosenIndex: data.choiceIndex,
      playerId: player.id,
      questionId: data.questionId,
      roomId: roomId,
      isCorrect: isResponseCorrect,
    });

    if (!answer) {
      console.log('Impossible de créer la réponse');
      return;
    }

    server.to('admin_' + roomId).emit('responseReceived', responseReceived);
    server.to('screen_' + roomId).emit('responseReceived', responseReceived);
  }

  /**
   * Vérifie les réponses
   */
  async checkTheAnswers(server: Server, client: Socket) {
    try {
      const roomId = client.data?.roomId;
      if (!roomId) {
        console.log('❌ checkTheAnswers - Aucune roomId trouvée.');
        return;
      }

      // Récupération de la question courante
      const currentQuestionId = await this.roomService.currentQuestionIdByRoomId(roomId);
      if (typeof currentQuestionId !== 'number') {
        console.log("❌ checkTheAnswers - Aucun questionId n'a été trouvé.");
        return;
      }

      // Récupération des réponses associées à cette question et cette room
      const answers = await this.prisma.answer.findMany({
        where: {
          questionId: currentQuestionId,
          roomId: roomId,
        },
      });

      if (!answers || answers.length === 0) {
        console.log("❌ checkTheAnswers - Aucune answer n'a été trouvée.");
        // On prévient quand même le front pour éviter un blocage possible
        // server.to('admin_' + roomId).emit('checkTheAnswers', { success: false, message: "Aucune réponse trouvée pour cette question." });
        return;
      }

      // Pour chaque réponse correcte, on incrémente le score du player correspondant
      for (const answer of answers) {
        if (answer.isCorrect) {
          try {
            await this.playerService.increaseScoreByPlayerId(answer.playerId);
          } catch (scoreErr) {
            console.log(
              `Erreur lors de l'incrémentation du score pour le joueur ${answer.playerId}:`,
              scoreErr,
            );
          }
        }
      }

      // On peut renvoyer un tableau structuré de réponses au front si besoin
      const responsesToSend = answers.map((ans) => ({
        playerId: ans.playerId,
        questionId: ans.questionId,
        chosenIndex: ans.chosenIndex,
        isCorrect: ans.isCorrect,
      }));

      server.to('room_' + roomId).emit('resultsAvailable');
      server.to('admin_' + roomId).emit('resultsAvailable');
      server
        .to('screen_' + roomId)
        .emit('resultsAvailable');
    } catch (error) {
      console.error('❌ checkTheAnswers - Erreur inattendue:', error);
    }
  }

  /**
   * Supprime une room (admin ou fin de partie)
   */
  async endTheQuizz(server: Server, client: Socket) {
    // Changer le statut de la room
    // remettre la current question de la room à NULL
    // Renvoyer le socket aux clients
    try {
      const roomId = client.data?.roomId;
      await this.prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          // TODO
          status: RoomStatus.CLOSED,
          currentQuestionId: null,
        },
      });

      server.to('room_' + roomId).emit('gameFinished');
      server.to('admin_' + roomId).emit('gameFinished');
      server.to('screen_' + roomId).emit('gameFinished');
    } catch (error) {}
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
