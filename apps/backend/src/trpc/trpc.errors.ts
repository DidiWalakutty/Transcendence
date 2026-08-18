import { TRPCError } from '@trpc/server';

export function notFoundError(message: string) {
  return new TRPCError({
    code: 'NOT_FOUND',
    message,
  });
}

export function conflictError(message: string) {
  return new TRPCError({
    code: 'CONFLICT',
    message,
  });
}

export function unauthorizedError(message: string) {
  return new TRPCError({
    code: 'UNAUTHORIZED',
    message,
  });
}
