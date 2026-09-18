import { ApiProperty } from '@nestjs/swagger';
import type { Link, LinkSource, LinkStatus } from '@url-shortener/types';

export class LinkEntity implements Link {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', description: 'Path segment the visitor hits' })
  slug: string;

  @ApiProperty({ type: 'string', description: 'Address the link points at' })
  targetUrl: string;

  @ApiProperty({ type: 'string', nullable: true, description: 'Admin-only label' })
  note: string | null;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  expiresAt: string | null;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  disabledAt: string | null;

  @ApiProperty({ type: 'number' })
  clickCount: number;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  lastVisitedAt: string | null;

  @ApiProperty({ enum: ['PUBLIC', 'ADMIN'] })
  source: LinkSource;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: string;

  @ApiProperty({ type: 'string', description: 'Absolute short URL' })
  shortUrl: string;

  @ApiProperty({ enum: ['ACTIVE', 'EXPIRED', 'DISABLED'] })
  status: LinkStatus;
}
