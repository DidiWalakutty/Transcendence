function getDatabaseError(error: unknown): Record<string, unknown> | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  if ('code' in error && typeof error.code === 'string') {
    return error as Record<string, unknown>;
  }

  if ('cause' in error && typeof error.cause === 'object' && error.cause !== null) {
    return error.cause as Record<string, unknown>;
  }

  return null;
}

export function isUniqueViolation(error: unknown) {
  return getDatabaseError(error)?.code === '23505';
}

export function getDatabaseConstraint(error: unknown) {
  return getDatabaseError(error)?.constraint;
}
