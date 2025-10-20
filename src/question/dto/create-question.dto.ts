import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  media_s3Key?: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true }) // Ensure each choice is not empty
  choices: string[]; // Changed to non-optional as it's an array of choices

  @IsInt()
  answerIndex: number;

  @IsOptional()
  @IsInt()
  quizzId?: number;
}
