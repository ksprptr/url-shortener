import { ApiProperty } from '@nestjs/swagger';
import type { ApiErrorResponse } from '@url-shortener/types';

/**
 * The `{ status, message }` envelope every failed request returns (`GlobalExceptionFilter`).
 **/
// `implements` keeps this Swagger schema and the shared contract from drifting apart.
export class ResponseEntity implements ApiErrorResponse {
  @ApiProperty({
    type: 'number',
    description: 'Response status code',
  })
  status: number;

  // An array whenever the ValidationPipe rejects a body — it reports one message per broken rule.
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    description: 'Response status message, or one message per failed validation rule',
  })
  message: string | string[];
}
