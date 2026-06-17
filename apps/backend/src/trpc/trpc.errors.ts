import { TRPCError } from '@trpc/server';

import { isUniqueViolation } from '../database/database.errors';

export function notFoundError(message: string) {
  return new TRPCError({
    code: 'NOT_FOUND',
    message,
  });
}

export function throwIfUniqueViolation(error: unknown, message: string) {
  if (!isUniqueViolation(error)) {
    return;
  }

  throw new TRPCError({
    code: 'CONFLICT',
    message,
  });
}
