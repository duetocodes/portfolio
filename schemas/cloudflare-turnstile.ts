import { z } from 'zod';

export const TurnstileTokenSchema = z.string().min(1).max(2048);
export const TurnstileTokenPayloadSchema = z.object({
  token: z.string().min(1).max(2048),
});

export type TurnstileOptions = {
  'action'?: string // This can only contain up to 32 alphanumeric characters including _ and -
  'cData'?: string // This can only contain up to 255 alphanumeric characters including _ and -
  'sitekey': string
  'language'?: string
  'appearance'?: 'always' | 'execute' | 'interaction-only'
  'execution'?: 'render' | 'execute'
  'theme'?: 'light' | 'dark'
  'callback'?: (token: string) => void
  'error-callback'?: (code: string) => void
  'expired-callback'?: (msg: string) => void
  'timeout-callback'?: (msg: string) => void
}
export type TurnstileAPI = {
  render: (
    container: string | HTMLElement,
    options: TurnstileOptions,
  ) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
  getResponse: (widgetId: string) => string | undefined
  execute: (widgetId: string) => void
  isExpired: (widgetId: string) => boolean
}

export const CloudflareSiteVerifyResponseSchema = z.object({
  'success': z.boolean(),
  'challenge_ts': z.iso.datetime().optional(),
  'error-codes': z.array(z.string()).optional(),
  'action': z.string().min(1).max(32).regex(/^[A-Za-z0-9_-]+$/).optional(), // This can only contain up to 32 alphanumeric characters including _ and -,
  'cdata': z.string().min(1).max(255).regex(/^[A-Za-z0-9_-]+$/).optional(), // This can only contain up to 255 alphanumeric characters including _ and -
  'hostname': z.string().optional(),
  'metadata': z.object({
    result_with_testing_key: z.boolean().optional(),
  }).optional(),
});

export const CloudflareSiteVerifyPayloadSchema = z.object({
  secret: z.string().min(1),
  response: TurnstileTokenSchema,
  remoteip: z.ipv4().or(z.ipv6()).optional(),
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
