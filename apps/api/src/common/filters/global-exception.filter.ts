import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

/** An Express/body-parser style error: a plain Error carrying an HTTP status (e.g. entity.too.large → 413). */
interface HttpErrorLike extends Error {
  status?: number;
  statusCode?: number;
  expose?: boolean;
}

/**
 * Reads a client-error status (4xx) off a non-Nest error, or null when there isn't a safe one.
 **/
// Only 4xx is trusted here; a 5xx stays a generic 500, and `expose` gates returning its message.
const clientErrorStatus = (error: HttpErrorLike): number | null => {
  const status = error.status ?? error.statusCode;
  return typeof status === 'number' && status >= 400 && status < 500 ? status : null;
};

/**
 * Query params whose values must never reach the logs.
 **/
const REDACTED_QUERY_PARAMS = new Set(['token', 'access_token', 'password']);

/**
 * Request URL with sensitive query values masked, for logging.
 **/
const safeUrl = (url: string): string => {
  const [path, query] = url.split('?');

  if (!query) {
    return path;
  }

  const params = new URLSearchParams(query);
  for (const key of [...params.keys()]) {
    if (REDACTED_QUERY_PARAMS.has(key.toLowerCase())) {
      params.set(key, '[redacted]');
    }
  }

  return `${path}?${params.toString()}`;
};

/**
 * Normalizes every exception to `{ status, message }`; unknown errors → 500.
 **/
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = this.extractHttpExceptionMessage(exception);

      const log =
        status >= 500 ? this.logger.error.bind(this.logger) : this.logger.warn.bind(this.logger);

      log(`[${status}] ${request.method} ${safeUrl(request.url)} - ${JSON.stringify(message)}`);

      response.status(status).json({ status, message });
      return;
    }

    // Express/body-parser errors arrive as plain Errors with a status — map their 4xx, not a 500.
    if (exception instanceof Error) {
      const status = clientErrorStatus(exception as HttpErrorLike);
      if (status !== null) {
        const message = (exception as HttpErrorLike).expose ? exception.message : 'Bad request.';
        this.logger.warn(
          `[${status}] ${request.method} ${safeUrl(request.url)} - ${exception.name}`,
        );
        response.status(status).json({ status, message });
        return;
      }
    }

    this.logger.error(
      `Unhandled exception at ${request.method} ${safeUrl(request.url)} from ${request.ip}`,
      exception instanceof Error ? exception : String(exception),
    );

    response.status(500).json({ status: 500, message: 'An unexpected error occurred.' });
  }

  private extractHttpExceptionMessage(exception: HttpException): unknown {
    const response = exception.getResponse();

    if (typeof response === 'object' && response !== null && 'message' in response) {
      return (response as { message?: unknown }).message ?? 'An error occurred.';
    }

    return response;
  }
}
