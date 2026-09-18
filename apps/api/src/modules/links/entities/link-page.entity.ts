import { ApiProperty } from '@nestjs/swagger';
import type { LinkPage } from '@url-shortener/types';

import { LinkEntity } from './link.entity';

export class LinkPageEntity implements LinkPage {
  @ApiProperty({ type: [LinkEntity] })
  items: LinkEntity[];

  @ApiProperty({ type: 'number', description: 'Total rows matching the filter' })
  total: number;

  @ApiProperty({ type: 'number' })
  page: number;

  @ApiProperty({ type: 'number' })
  pageSize: number;

  @ApiProperty({ type: 'number' })
  pageCount: number;
}
