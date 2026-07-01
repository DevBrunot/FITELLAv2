// file: src/modules/workouts/dto/workout.dto.ts
import {
  IsString, IsOptional, IsEnum, IsBoolean, IsArray,
  ValidateNested, IsUUID, IsInt, Min, Max, ValidateIf,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutType } from '../../../entities/workout.entity';

export class WorkoutExerciseDto {
  @IsUUID()
  exerciseId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @IsOptional()
  @IsBoolean()
  useTime?: boolean;

  /** Required when useTime = false */
  @ValidateIf((o) => !o.useTime)
  @IsInt()
  @Min(1)
  reps?: number;

  /** Required when useTime = true (seconds) */
  @ValidateIf((o) => o.useTime === true)
  @IsInt()
  @Min(1)
  timeOn?: number;

  @IsOptional()
  @IsInt()
  restSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class CreateWorkoutDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkoutType)
  type?: WorkoutType;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseDto)
  exercises?: WorkoutExerciseDto[];
}

export class UpdateWorkoutDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkoutType)
  type?: WorkoutType;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseDto)
  exercises?: WorkoutExerciseDto[];
}

export class SendWorkoutDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  studentIds: string[];
}
