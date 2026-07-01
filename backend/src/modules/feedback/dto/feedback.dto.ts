// file: src/modules/feedback/dto/feedback.dto.ts
import { IsInt, Min, Max, IsOptional, IsString, IsEnum } from 'class-validator';

export enum EffortLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard',
}

export class CreateWorkoutFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(EffortLevel)
  effort?: EffortLevel;

  @IsOptional()
  @IsString()
  painOrDiscomfort?: string;
}
