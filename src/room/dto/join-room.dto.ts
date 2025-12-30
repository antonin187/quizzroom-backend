import { IsEmpty, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  code: string;


  @IsString()
  @IsNotEmpty()
  pseudo: string;


  @IsString()
  player_token: string | null;
}
