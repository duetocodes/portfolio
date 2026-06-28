import { z } from 'zod';

import { TurnstileTokenSchema, TurnstileActionFieldSchema } from './cloudflare-turnstile';

export const TurnstileDemoPayloadSchema = z.object({
  demoinput: z.string().min(3).max(100),
  isSimulateFail: z.boolean().optional(),
  token: TurnstileTokenSchema,
  action: TurnstileActionFieldSchema,
});

export type TurnstileDemoPayload = z.output<typeof TurnstileDemoPayloadSchema>
