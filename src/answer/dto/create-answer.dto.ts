import { IsBoolean, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {

  @IsInt()
  chosenIndex: number;

  @IsInt()
  playerId: number;

  @IsInt()
  questionId: number;

  @IsInt()
  roomId: number;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsString()
  input: string;


}
