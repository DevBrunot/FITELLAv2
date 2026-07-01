// file: src/modules/exercises/dto/exercise.dto.ts
import {
  IsString, IsOptional, IsBoolean, IsEnum, IsUrl,
} from 'class-validator';
import { ExerciseCategory } from '../../../entities/exercise.entity';

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory;

  @IsOptional()
  @IsBoolean()
  postPartumOnly?: boolean;
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory;

  @IsOptional()
  @IsBoolean()
  postPartumOnly?: boolean;
}
