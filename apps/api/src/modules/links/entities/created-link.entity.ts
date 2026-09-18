import { ApiProperty } from '@nestjs/swagger';
import type { CreatedLink } from '@url-shortener/types';

export class CreatedLinkEntity implements CreatedLink {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string' })
  slug: string;

  @ApiProperty({ type: 'string', description: 'Absolute short URL' })
  shortUrl: string;

  @ApiProperty({ type: 'string' })
  targetUrl: string;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  expiresAt: string | null;
}
