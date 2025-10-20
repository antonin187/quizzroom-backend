import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuizzDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  s3Key?: string;
}
