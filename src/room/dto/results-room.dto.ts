import { IsEmpty, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ResultsRoomDto {
  @IsString()
  @IsNotEmpty()
  roomCode: string;
}
