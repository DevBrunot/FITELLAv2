// file: src/modules/anamnesis/dto/anamnesis.dto.ts
import {
  IsBoolean, IsOptional, IsInt, IsString, IsDateString, Equals,
} from 'class-validator';

export class CreateAnamnesisDto {
  @IsOptional()
  @IsInt()
  gestationalWeeks?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  isPostPartum?: boolean;

  @IsOptional()
  @IsInt()
  weeksPostPartum?: number;

  @IsOptional()
  @IsBoolean()
  hasPreviousExerciseHistory?: boolean;

  @IsOptional()
  @IsString()
  medicalRestrictions?: string;

  @IsOptional()
  @IsString()
  healthObservations?: string;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  doctorPhone?: string;

  /** LGPD consent is required and must be true */
  @IsBoolean()
  @Equals(true, { message: 'lgpdConsent must be true to proceed' })
  lgpdConsent: boolean;
}

export class UpdateAnamnesisDto {
  @IsOptional()
  @IsInt()
  gestationalWeeks?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  isPostPartum?: boolean;

  @IsOptional()
  @IsInt()
  weeksPostPartum?: number;

  @IsOptional()
  @IsBoolean()
  hasPreviousExerciseHistory?: boolean;

  @IsOptional()
  @IsString()
  medicalRestrictions?: string;

  @IsOptional()
  @IsString()
  healthObservations?: string;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  doctorPhone?: string;
}
