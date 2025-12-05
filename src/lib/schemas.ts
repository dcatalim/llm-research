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
		.boolean()
		.refine((val) => val === true, {
			message: 'You should accept the Terms & Conditions if you wish to proceed.'
		})
});
export type RegisterSchema = typeof registerSchema;

export const userUpdateSchema = z.object({
	name: z.string().nonempty(),
	surname: z.string().nonempty(),
	email: z.email().nonempty()
});
export type UserUpdateSchema = typeof userUpdateSchema;

export const modelConfigurationSchema = z.object({
	name: z.string().nonempty(),
	instructions: z.string().nonempty(),
	// provider: z.string().nonempty(),
	version: z.string().nonoptional(),
	systemPrompt: z.string().optional(),

	temperature: z.number().min(0).max(2).default(1),
	topP: z.number().min(0).max(1).default(1),
	topK: z.number().min(0).default(0),
	frequencyPenalty: z.number().min(-2).max(2).default(0),
	presencePenalty: z.number().min(-2).max(2).default(0),
	// repetitionPenalty: z.number().min(0).max(2).default(1),
	// minP: z.number().min(0).max(1).default(0),
	// topA: z.number().min(0).max(1).default(0),
	maxTokens: z.number().min(1).default(4096),

	apiKey: z.string().nonempty(),
	suggestedMessages: z.array(z.string()).default([]),
	stopSequences: z.array(z.string()).default([])
});
export type ModelConfigurationSchema = typeof modelConfigurationSchema;

export const apiKeySchema = z.object({
	name: z.string().nonempty(),
	apiKey: z.string().nonempty()
});
export type ApiKeySchema = typeof apiKeySchema;
