import { z } from 'zod';

export const TurnstileTokenSchema = z.string().min(1).max(2048);
export const TurnstileActionFieldSchema = z.string().max(32).regex(/^[A-Za-z0-9_-]+$/).optional(); // This can only contain up to 32 alphanumeric characters including _ and -
export const TurnstileCDataFieldSchema = z.string().max(255).regex(/^[A-Za-z0-9_-]+$/).optional(); // This can only contain up to 255 alphanumeric characters including _ and -
export const TurnstileTokenPayloadSchema = z.object({
  token: z.string().min(1).max(2048),
});

const TurnstileOptionsSchema = z.object({
  'action': TurnstileActionFieldSchema,
  'cData': TurnstileCDataFieldSchema,
  'sitekey': z.string().min(1),
  'language': z.string().optional(),
  'appearance': z.enum(['always', 'execute', 'interaction-only']).optional(),
  'execution': z.enum(['render', 'execute']).optional(),
  'theme': z.enum(['light', 'dark']).optional(),
  'callback': z.function().args(z.string()).returns(z.void()).optional(),
  'error-callback': z.function().args(z.string()).returns(z.void()).optional(),
  'expired-callback': z.function().args().returns(z.void()).optional(),
  'timeout-callback': z.function().args().returns(z.void()).optional(),
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
  'success': z.boolean(),
  'challenge_ts': z.string().datetime().optional(),
  'error-codes': z.array(z.string()).optional(),
  'action': TurnstileActionFieldSchema,
  'cdata': z.string().optional(),
  'hostname': z.string().optional(),
  'metadata': z.object({
    result_with_testing_key: z.boolean().optional(),
  }).optional(),
});

export const CloudflareSiteVerifyPayloadSchema = z.object({
  secret: z.string().min(1),
  response: TurnstileTokenSchema,
  // remoteip: z.ipv4().or(z.ipv6()).optional(), // need zod4
});

export type CloudflareTurnstileExpose = {
  widgetId: string
  renderThenExecute: () => void
  resetThenRemove: () => void
}

export type CloudflareSiteVerifyPayload = z.infer<typeof CloudflareSiteVerifyPayloadSchema>;
export type CloudflareSiteVerifyResponse = z.infer<typeof CloudflareSiteVerifyResponseSchema>;
export type TurnstileToken = z.infer<typeof TurnstileTokenSchema>;
export type TurnstileTokenPayload = z.infer<typeof TurnstileTokenPayloadSchema>;
export type TurnstileAPI = z.infer<typeof TurnstileAPISchema>;
