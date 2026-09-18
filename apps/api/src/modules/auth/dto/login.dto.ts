import { ApiProperty } from '@nestjs/swagger';
import type { LoginPayload } from '@url-shortener/types';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto implements LoginPayload {
  @ApiProperty({ type: 'string', description: 'Password', maxLength: 128 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
