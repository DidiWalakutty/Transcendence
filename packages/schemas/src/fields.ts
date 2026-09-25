import { z } from 'zod';

export const validationLocales = ['en', 'nl', 'es'] as const;
export type ValidationLocale = (typeof validationLocales)[number];

const validationMessages = {
  en: {
    invalidEmail: 'Must be a valid email address',
    nameMin: 'Name must be at least 3 characters',
    usernameMin: 'Username must be at least 3 characters',
    passwordMin: 'Password must be at least 8 characters',
    passwordMax: 'Password must be at most 128 characters',
    imageTooLarge: 'Image is too large',
    imageInvalid: 'Image must be an uploaded picture',
    passwordsDoNotMatch: 'Passwords do not match',
    confirmPassword: 'Please confirm your password',
    passwordRequired: 'Password is required',
  },
  nl: {
    invalidEmail: 'Voer een geldig e-mailadres in',
    nameMin: 'Naam moet minimaal 3 tekens lang zijn',
    usernameMin: 'Gebruikersnaam moet minimaal 3 tekens lang zijn',
    passwordMin: 'Wachtwoord moet minimaal 8 tekens lang zijn',
    passwordMax: 'Wachtwoord mag maximaal 128 tekens lang zijn',
    imageTooLarge: 'Afbeelding is te groot',
    imageInvalid: 'Afbeelding moet een geüploade foto zijn',
    passwordsDoNotMatch: 'Wachtwoorden komen niet overeen',
    confirmPassword: 'Bevestig je wachtwoord',
    passwordRequired: 'Wachtwoord is verplicht',
  },
  es: {
    invalidEmail: 'Debe ser una dirección de correo válida',
    nameMin: 'El nombre debe tener al menos 3 caracteres',
    usernameMin: 'El nombre de usuario debe tener al menos 3 caracteres',
    passwordMin: 'La contraseña debe tener al menos 8 caracteres',
    passwordMax: 'La contraseña debe tener como máximo 128 caracteres',
    imageTooLarge: 'La imagen es demasiado grande',
    imageInvalid: 'La imagen debe ser una foto subida',
    passwordsDoNotMatch: 'Las contraseñas no coinciden',
    confirmPassword: 'Confirma tu contraseña',
    passwordRequired: 'La contraseña es obligatoria',
  },
} as const;

export function getValidationMessage(
  locale: string | undefined,
  key: keyof typeof validationMessages.en,
) {
  const normalizedLocale = validationLocales.includes(locale as ValidationLocale)
    ? (locale as ValidationLocale)
    : 'en';

  return validationMessages[normalizedLocale][key];
}

export function makeEmailField(locale: string = 'en') {
  return z.email(getValidationMessage(locale, 'invalidEmail'));
}

export function makeNameField(locale: string = 'en') {
  return z.string().min(3, getValidationMessage(locale, 'nameMin')).max(50);
}

export function makeUsernameField(locale: string = 'en') {
  return z.string().min(3, getValidationMessage(locale, 'usernameMin')).max(30);
}

export function makePasswordField(locale: string = 'en') {
  return z
    .string()
    .min(8, getValidationMessage(locale, 'passwordMin'))
    .max(128, getValidationMessage(locale, 'passwordMax'));
}

export const emailField = makeEmailField();

export const nameField = makeNameField();

export const usernameField = makeUsernameField();

export const passwordField = makePasswordField();

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

export function imageField(placeholder: string, maxLength: number, locale: string = 'en') {
  return z
    .string()
    .max(maxLength, getValidationMessage(locale, 'imageTooLarge'))
    .refine(
      (value) => value === placeholder || value.startsWith('data:image/'),
      getValidationMessage(locale, 'imageInvalid'),
    );
}

export function uuidField() {
  return z.uuid();
}

export function withPasswordConfirmation<TPasswordKey extends string, TConfirmKey extends string>(
  passwordKey: TPasswordKey,
  confirmKey: TConfirmKey,
  locale: string = 'en',
) {
  return <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
    schema.refine(
      (data) => {
        if (typeof data !== 'object' || data === null) return false;
        const record = data as Record<string, unknown>;
        return record[passwordKey] === record[confirmKey];
      },
      { message: getValidationMessage(locale, 'passwordsDoNotMatch'), path: [confirmKey] },
    );
}
