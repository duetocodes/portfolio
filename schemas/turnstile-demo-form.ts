import { z } from 'zod';

import { TurnstileTokenSchema } from './turnstile';

export const TurnstileDemoPayloadSchema = z.object({
  demoinput: z.string().min(3).max(100),
  token: TurnstileTokenSchema,
  isSimulateFail: z.boolean().optional(),
});

export type TurnstileDemoPayload = z.output<typeof TurnstileDemoPayloadSchema>
