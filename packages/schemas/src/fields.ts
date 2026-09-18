import { z } from 'zod';

export const emailField = z.email('Must be a valid email address');

export const nameField = z.string().min(3, 'Name must be at least 3 characters').max(50);

export const usernameField = z.string().min(3, 'Username must be at least 3 characters').max(30);

export const passwordField = z.string().min(8, 'Password must be at least 8 characters');

// Stored in `users.avatar_link` / `events.image_link` when no picture was
// uploaded; the frontend swaps it for its bundled fallback image.
export const NO_AVATAR = 'PLACEHOLDER';
export const EVENT_PLACEHOLDER = 'PLACEHOLDER';

// Pictures cross the wire as data URLs the client has already compressed to
// these lengths (see apps/frontend/src/lib/image.ts). The server accepts
// nothing else, so a hand-crafted request cannot store arbitrary text there.
export const MAX_EVENT_IMAGE_BYTES = 72 * 1024;
export const MAX_AVATAR_IMAGE_BYTES = 48 * 1024;
export const MAX_SOURCE_IMAGE_SIZE = 10 * 1024 * 1024;

export function imageField(placeholder: string, maxLength: number) {
  return z
    .string()
    .max(maxLength, 'Image is too large')
    .refine(
      (value) => value === placeholder || value.startsWith('data:image/'),
      'Image must be an uploaded picture',
    );
}

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
