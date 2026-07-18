import { z } from 'zod';
import { TurnstileTokenSchema } from '../cloudflare-turnstile';

export const TURNSTILE_ACTION = 'turnstile-demo';

// need to find better way to handle error messages when schema is exported
export const TurnstileDemoInputSchema = z.string().min(3, 'Min. 3 characters').max(6, 'Max. 6 characters');
export type TurnstileDemoInput = z.infer<typeof TurnstileDemoInputSchema>;

export const TurnstileDemoPayloadSchema = z.object({
  demoinput: TurnstileDemoInputSchema,
  isSimulateFail: z.boolean().optional(),
  token: TurnstileTokenSchema,
});

export type TurnstileDemoPayload = z.infer<typeof TurnstileDemoPayloadSchema>
