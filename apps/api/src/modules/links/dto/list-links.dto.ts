import { ApiPropertyOptional } from '@nestjs/swagger';
import type {
  LinkSortField,
  LinkStatus,
  ListLinksQuery,
  SortDirection,
} from '@url-shortener/types';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

import { MAX_PAGE_SIZE } from '../links.constants';

const SORT_FIELDS: LinkSortField[] = [
  'createdAt',
  'clickCount',
  'expiresAt',
  'lastVisitedAt',
  'slug',
];
const STATUSES: LinkStatus[] = ['ACTIVE', 'EXPIRED', 'DISABLED'];
const DIRECTIONS: SortDirection[] = ['asc', 'desc'];

/** Query of the admin link listing. */
export class ListLinksDto implements ListLinksQuery {
  @ApiPropertyOptional({ type: 'number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: 'number', minimum: 1, maximum: MAX_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({ type: 'string', description: 'Matches slug, target URL or note' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: LinkStatus;

  @ApiPropertyOptional({ enum: SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORT_FIELDS)
  sort?: LinkSortField;

  @ApiPropertyOptional({ enum: DIRECTIONS, default: 'desc' })
  @IsOptional()
  @IsIn(DIRECTIONS)
  direction?: SortDirection;
}
