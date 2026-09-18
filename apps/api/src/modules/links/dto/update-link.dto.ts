import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateLinkPayload } from '@url-shortener/types';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { MAX_TARGET_URL_LENGTH, SLUG_PATTERN } from '../links.constants';

/** Admin edit form; omitted fields are left untouched. */
export class UpdateLinkDto implements UpdateLinkPayload {
  @ApiPropertyOptional({ type: 'string', maxLength: MAX_TARGET_URL_LENGTH })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TARGET_URL_LENGTH)
  targetUrl?: string;

  @ApiPropertyOptional({ type: 'string', pattern: SLUG_PATTERN.source })
  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'Slug must be 3-64 characters of letters, digits, dashes or underscores.',
  })
  slug?: string;

  @ApiPropertyOptional({ type: 'string', nullable: true, maxLength: 200 })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  @MaxLength(200)
  note?: string | null;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsDateString()
  expiresAt?: string | null;

  @ApiPropertyOptional({ type: 'boolean', description: 'Take the link offline / put it back' })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}
