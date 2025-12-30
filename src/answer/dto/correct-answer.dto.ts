export class CorrectAnswerPlayerDto {
  id: number;
  pseudo: string;
  connected: boolean;
  score: number;
  socketId: string | null;
  roomId: number;
  createdAt: string;
  updatedAt: string;
}

export class CorrectAnswerQuestionDto {
  id: number;
  title: string;
  media_s3Key: string | null;
  choices: string[];
  answerIndex: number;
  quizzId: number;
  createdAt: string;
  updatedAt: string;
}

export class CorrectAnswerRoomDto {
  id: number;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  quizzId: number;
  currentQuestionId: number;
}

export class CorrectAnswerDto {
  id: number;
  chosenIndex: number;
  playerId: number;
  questionId: number;
  roomId: number;
  createdAt: string;
  updatedAt: string;
  input: string;
  player: CorrectAnswerPlayerDto;
  question: CorrectAnswerQuestionDto;
  room: CorrectAnswerRoomDto;
}
