import { z } from 'zod';
import { emailField, nameField, passwordField, usernameField } from '@repo/schemas/fields';

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z
  .object({
    name: nameField,
    email: emailField,
    username: usernameField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyTotpSchema = z.object({
  code: z.string().length(6),
});

export type SignInDto = z.infer<typeof signInSchema>;
export type SignUpDto = z.infer<typeof signUpSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type VerifyTotpDto = z.infer<typeof verifyTotpSchema>;
