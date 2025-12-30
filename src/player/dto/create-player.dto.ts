import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  codeRoom: string;

  @IsString()
  @IsNotEmpty()
  pseudo: string;
}