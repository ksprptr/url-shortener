import { ApiProperty } from '@nestjs/swagger';
import type { AuthUser } from '@url-shortener/types';

export class AuthUserEntity implements AuthUser {
  @ApiProperty({ type: 'boolean', description: 'Whether the request carries a valid session' })
  authenticated: boolean;
}
