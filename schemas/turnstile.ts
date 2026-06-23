import { z } from 'zod';

export const TurnstileTokenSchema = z.string().min(1).max(2048);

export const TurnstileTokenPayloadSchema = z.object({
  token: z.string().min(1).max(2048),
});

const TurnstileOptionsSchema = z.object({
  'sitekey': z.string().min(1),
  'language': z.string().optional(),
  'appearance': z.enum(['always', 'execute', 'interaction-only']).optional(),
  'execution': z.enum(['render', 'execute']).optional(),
  'callback': z.function()
    .args(z.string())
    .returns(z.void())
    .optional(),
  'error-callback': z.function()
    .args(z.string())
    .returns(z.void())
    .optional(),
  'expired-callback': z.function()
    .args()
    .returns(z.void())
    .optional(),
  'timeout-callback': z.function()
    .args()
    .returns(z.void())
    .optional(),
});

export const TurnstileAPISchema = z.object({
  render: z.function()
    .args(z.string(), TurnstileOptionsSchema)
    .returns(z.string()),
  reset: z.function()
    .args(z.string())
    .returns(z.void()),
  remove: z.function()
    .args(z.string())
    .returns(z.void()),
  getResponse: z.function()
    .args(z.string())
    .returns(z.string().optional()),
  execute: z.function()
    .args(z.string())
    .returns(z.void()),
  isExpired: z.function()
    .args(z.string())
    .returns(z.boolean()),
});

export const CloudflareSiteVerifyResponseSchema = z.object({
  success: z.boolean(),
  challenge_ts: z.string().datetime().optional(),
});

export type TurnstileToken = z.infer<typeof TurnstileTokenSchema>;
export type TurnstileTokenPayload = z.infer<typeof TurnstileTokenPayloadSchema>;
export type TurnstileAPI = z.infer<typeof TurnstileAPISchema>;
