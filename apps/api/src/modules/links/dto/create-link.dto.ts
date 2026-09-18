import { ApiProperty } from '@nestjs/swagger';
import type { CreateLinkPayload, Expiration } from '@url-shortener/types';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { MAX_TARGET_URL_LENGTH } from '../links.constants';

const EXPIRATIONS: Expiration[] = ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR', 'NEVER'];

/** Body of the public shorten form — a preset expiry, never an arbitrary date. */
export class CreateLinkDto implements CreateLinkPayload {
  @ApiProperty({
    type: 'string',
    description: 'Address the short link points at',
    maxLength: MAX_TARGET_URL_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TARGET_URL_LENGTH)
  targetUrl: string;

  @ApiProperty({ enum: EXPIRATIONS, description: 'How long the link stays alive' })
  @IsIn(EXPIRATIONS)
  expiration: Expiration;
}
