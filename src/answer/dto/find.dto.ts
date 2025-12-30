import { IsEmail, IsInt, IsString } from 'class-validator';

export class FindByQuestionIdAndRoomIdDto {
  @IsInt()
  questionId: number;

  @IsString()
  roomCode: string;
}
