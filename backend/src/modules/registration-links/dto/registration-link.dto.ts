// file: src/modules/registration-links/dto/registration-link.dto.ts
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { LinkType } from '../../../entities/registration-link.entity';

export class CreateRegistrationLinkDto {
  @IsOptional()
  @IsEnum(LinkType)
  linkType?: LinkType;

  /** When linkType = expirable, number of days until expiration */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number;
}
