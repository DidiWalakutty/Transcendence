import { z } from 'zod';

export const emailField = z.email('Must be a valid email address');

export const nameField = z.string().min(3, 'Name must be at least 3 characters').max(50);

export const usernameField = z.string().min(3, 'Username must be at least 3 characters').max(30);

export const passwordField = z.string().min(8, 'Password must be at least 8 characters');

export function uuidField() {
  return z.uuid();
}

export function withPasswordConfirmation<TPasswordKey extends string, TConfirmKey extends string>(
  passwordKey: TPasswordKey,
  confirmKey: TConfirmKey,
) {
  return <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
    schema.refine(
      (data) => {
        if (typeof data !== 'object' || data === null) return false;
        const record = data as Record<string, unknown>;
        return record[passwordKey] === record[confirmKey];
      },
      { message: 'Passwords do not match', path: [confirmKey] },
    );
}
