import { z } from 'zod/v4';

export const loginSchema = z.object({
	email: z.email(),
	password: z.string()
});
export type LoginSchema = typeof loginSchema;

export const resetPasswordSchema = z.object({
	email: z.email()
});
export type ResetPasswordSchema = typeof resetPasswordSchema;

export const registerSchema = z.object({
	name: z.string(),
	surname: z.string(),
	email: z.email(),
	password: z.string(),
	acceptTerms: z.boolean('You should accept the Terms & Conditions if you wish to proceed.')
});
export type RegisterSchema = typeof registerSchema;
