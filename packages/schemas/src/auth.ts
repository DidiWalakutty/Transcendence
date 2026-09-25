import { z } from 'zod';
import {
  getValidationMessage,
  makeEmailField,
  makeNameField,
  makePasswordField,
  makeUsernameField,
} from '@repo/schemas/fields';

export function makeSignInSchema(locale: string = 'en') {
  return z.object({
    email: makeEmailField(locale),
    password: z.string().min(1, getValidationMessage(locale, 'passwordRequired')),
  });
}

export const signInSchema = makeSignInSchema();

export function makeSignUpSchema(locale: string = 'en') {
  return z
    .object({
      name: makeNameField(locale),
      email: makeEmailField(locale),
      username: makeUsernameField(locale),
      password: makePasswordField(locale),
      confirmPassword: z.string().min(1, getValidationMessage(locale, 'confirmPassword')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: getValidationMessage(locale, 'passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });
}

export const signUpSchema = makeSignUpSchema();

export function makeForgotPasswordSchema(locale: string = 'en') {
  return z.object({
    email: makeEmailField(locale),
  });
}

export const forgotPasswordSchema = makeForgotPasswordSchema();

export function makeResetPasswordSchema(locale: string = 'en') {
  return z
    .object({
      newPassword: makePasswordField(locale),
      confirmPassword: z.string().min(1, getValidationMessage(locale, 'confirmPassword')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: getValidationMessage(locale, 'passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });
}

export const resetPasswordSchema = makeResetPasswordSchema();

export const verifyTotpSchema = z.object({
  code: z.string().length(6),
});

export type SignInDto = z.infer<typeof signInSchema>;
export type SignUpDto = z.infer<typeof signUpSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type VerifyTotpDto = z.infer<typeof verifyTotpSchema>;
