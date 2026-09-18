import { ApiProperty } from '@nestjs/swagger';
import type { ResolvedLink } from '@url-shortener/types';

export class ResolvedLinkEntity implements ResolvedLink {
  @ApiProperty({ type: 'string', description: 'Address to redirect the visitor to' })
  targetUrl: string;
}
