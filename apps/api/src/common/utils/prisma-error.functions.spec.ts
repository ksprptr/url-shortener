import { ConflictException, HttpException, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

import { handlePrismaError } from './prisma-error.functions';

const prismaError = (code: string) =>
  new PrismaClientKnownRequestError('boom', { code, clientVersion: 'test' });

describe('handlePrismaError', () => {
  it('maps P2002 to a 409 with the provided message', () => {
    expect(() => handlePrismaError(prismaError('P2002'), { P2002: 'taken' })).toThrow(
      ConflictException,
    );
    try {
      handlePrismaError(prismaError('P2002'), { P2002: 'taken' });
    } catch (error) {
      expect((error as ConflictException).message).toBe('taken');
    }
  });

  it('maps P2003 to a 409', () => {
    expect(() => handlePrismaError(prismaError('P2003'), { P2003: 'fk' })).toThrow(
      ConflictException,
    );
  });

  it('maps P2025 to a 404', () => {
    expect(() => handlePrismaError(prismaError('P2025'), { P2025: 'gone' })).toThrow(
      NotFoundException,
    );
  });

  it('rethrows a known code that has no message mapping', () => {
    const error = prismaError('P2002');

    expect(() => handlePrismaError(error, {})).toThrow(error);
  });

  it('rethrows an already-formed HttpException untouched', () => {
    const http = new ConflictException('already handled');

    expect(() => handlePrismaError(http, { P2002: 'ignored' })).toThrow(http);
  });

  it('rethrows a non-Prisma error untouched', () => {
    const error = new Error('unrelated');

    expect(() => handlePrismaError(error, { P2002: 'x' })).toThrow(error);
  });

  it('always throws (never returns)', () => {
    expect(() => handlePrismaError(new Error('x'), {})).toThrow();
  });

  it('a mapped HttpException carries the right status', () => {
    try {
      handlePrismaError(prismaError('P2025'), { P2025: 'gone' });
    } catch (error) {
      expect((error as HttpException).getStatus()).toBe(404);
    }
  });
});
