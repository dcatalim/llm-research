import { z } from 'zod/v4';

export const loginSchema = z.object({
	email: z.email().nonempty(),
	password: z.string().nonempty()
});
export type LoginSchema = typeof loginSchema;

export const resetPasswordSchema = z.object({
	email: z.email().nonempty()
});
export type ResetPasswordSchema = typeof resetPasswordSchema;

export const registerSchema = z.object({
	name: z.string().nonempty(),
	surname: z.string().nonempty(),
	email: z.email().nonempty(),
	password: z.string().nonempty(),
	acceptTerms: z
		.boolean('You should accept the Terms & Conditions if you wish to proceed.')
		.parse(true)
});
export type RegisterSchema = typeof registerSchema;

export const userUpdateSchema = z.object({
	name: z.string().nonempty(),
	surname: z.string().nonempty(),
	email: z.email().nonempty(),
	openRouterKey: z.string().optional() // Add this field
});
export type UserUpdateSchema = typeof userUpdateSchema;

export const modelConfigurationSchema = z.object({
	name: z.string().nonempty(),
	provider: z.string().nonempty(),
	version: z.string().nonoptional(),
	systemPrompt: z.string().optional(),
	temperature: z.number().default(0.7),
	maxTokens: z.number().default(2048),
	topP: z.number().default(0.9),
	frequencyPenalty: z.number().default(0),
	api_key: z.string().nonempty(),
	instructions: z.string().nonempty()
});
export type ModelConfigurationSchema = typeof modelConfigurationSchema;

export const apiKeySchema = z.object({
	name: z.string().nonempty(),
	apiKey: z.string().nonempty()
});
export type ApiKeySchema = typeof apiKeySchema;
