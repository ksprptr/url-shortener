import { type ArgumentsHost, BadRequestException, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let status: jest.Mock;
  let json: jest.Mock;
  let response: Response;

  const hostFor = (request: Partial<Request>): ArgumentsHost =>
    ({
      switchToHttp: () => ({ getResponse: () => response, getRequest: () => request }),
    }) as unknown as ArgumentsHost;

  const request = (over: Partial<Request> = {}): Partial<Request> => ({
    method: 'POST',
    url: '/api/v1/links',
    ip: '1.2.3.4',
    ...over,
  });

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn(() => ({ json }));
    response = { status } as unknown as Response;
    filter = new GlobalExceptionFilter();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('normalizes a Nest HttpException to { status, message }', () => {
    filter.catch(new BadRequestException('bad input'), hostFor(request()));

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ status: 400, message: 'bad input' });
  });

  it('maps a non-Nest 4xx error (e.g. body-parser 413) to its real status', () => {
    const tooLarge = Object.assign(new Error('request entity too large'), {
      status: 413,
      expose: true,
    });

    filter.catch(tooLarge, hostFor(request()));

    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({ status: 413, message: 'request entity too large' });
  });

  it('hides the message of a non-exposed 4xx behind a generic one', () => {
    const err = Object.assign(new Error('internal detail'), { statusCode: 400, expose: false });

    filter.catch(err, hostFor(request()));

    expect(json).toHaveBeenCalledWith({ status: 400, message: 'Bad request.' });
  });

  it('never lets a library dictate a 5xx — it stays a generic 500', () => {
    const err = Object.assign(new Error('db exploded'), { status: 503, expose: true });

    filter.catch(err, hostFor(request()));

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ status: 500, message: 'An unexpected error occurred.' });
  });

  it('turns an unknown error into a generic 500 without leaking its message', () => {
    filter.catch(new Error('stack-y internal detail'), hostFor(request()));

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ status: 500, message: 'An unexpected error occurred.' });
  });

  it('redacts sensitive query params from the logged URL', () => {
    const warn = jest.spyOn(Logger.prototype, 'warn');

    filter.catch(
      new HttpException('nope', 400),
      hostFor(request({ url: '/api/v1/auth/login?token=supersecret&keep=1' })),
    );

    const logged = warn.mock.calls[0][0] as string;
    // URLSearchParams url-encodes the brackets, so the marker appears as %5Bredacted%5D.
    expect(logged).toContain('token=%5Bredacted%5D');
    expect(logged).not.toContain('supersecret');
    expect(logged).toContain('keep=1');
  });
});
