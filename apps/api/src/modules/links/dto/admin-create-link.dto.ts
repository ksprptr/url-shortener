import { ApiPropertyOptional } from '@nestjs/swagger';
import type { AdminCreateLinkPayload } from '@url-shortener/types';
import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { SLUG_PATTERN } from '../links.constants';
import { CreateLinkDto } from './create-link.dto';

/** Admin create form — an absolute expiry, an optional custom slug and an optional note. */
export class AdminCreateLinkDto
  extends CreateLinkDto
  implements Omit<AdminCreateLinkPayload, 'targetUrl'>
{
  @ApiPropertyOptional({
    type: 'string',
    description: 'Custom slug; generated when omitted',
    pattern: SLUG_PATTERN.source,
  })
  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'Slug must be 3-64 characters of letters, digits, dashes or underscores.',
  })
  slug?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Admin-only label', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    nullable: true,
    description: 'Absolute expiry; null or omitted = never expires',
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsDateString()
  expiresAt?: string | null;
}
