import { TRPCError } from '@trpc/server';
import { UserEmailAlreadyExistsError } from '../users/errors/user-email-already-exists.error';
import { UserUsernameAlreadyExistsError } from '../users/errors/user-username-already-exists.error';

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

export function forbiddenError(message: string) {
  return new TRPCError({
    code: 'FORBIDDEN',
    message,
  });
}

export function orNotFound<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw notFoundError(message);
  }
  return value;
}

export function assertFound<T>(
  value: T | null | undefined,
  message: string,
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw notFoundError(message);
  }
}

export function mapUserConflict(error: unknown): never {
  if (
    error instanceof UserEmailAlreadyExistsError ||
    error instanceof UserUsernameAlreadyExistsError
  ) {
    throw conflictError(error.message);
  }

  throw error;
}

export async function handleUserConflict<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    return mapUserConflict(error);
  }
}
