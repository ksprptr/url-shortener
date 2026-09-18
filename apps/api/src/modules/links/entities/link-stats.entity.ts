import { ApiProperty } from '@nestjs/swagger';
import type { DailyStat, LinkStats } from '@url-shortener/types';

import { LinkEntity } from './link.entity';

export class DailyStatEntity implements DailyStat {
  @ApiProperty({ type: 'string', example: '2026-09-17', description: 'UTC day' })
  date: string;

  @ApiProperty({ type: 'number' })
  clicks: number;

  @ApiProperty({ type: 'number' })
  created: number;
}

export class LinkStatsEntity implements LinkStats {
  @ApiProperty({ type: 'number' })
  totalLinks: number;

  @ApiProperty({ type: 'number' })
  activeLinks: number;

  @ApiProperty({ type: 'number' })
  expiredLinks: number;

  @ApiProperty({ type: 'number' })
  disabledLinks: number;

  @ApiProperty({ type: 'number' })
  totalClicks: number;

  @ApiProperty({ type: 'number' })
  clicksLast30Days: number;

  @ApiProperty({ type: 'number' })
  createdLast30Days: number;

  @ApiProperty({ type: [LinkEntity] })
  topLinks: LinkEntity[];

  @ApiProperty({ type: [DailyStatEntity] })
  daily: DailyStatEntity[];
}
