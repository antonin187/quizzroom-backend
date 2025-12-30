import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CurrentQuestionDto {
  @IsString()
  @IsNotEmpty()
  roomCode: string;
}
