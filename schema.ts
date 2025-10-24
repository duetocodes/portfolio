import { z } from 'zod';

export const TypingGameFeedbackRequestCharacterSchema = z.object({
  expectedKey: z.string(),
  lastTypedKey: z.string().optional(),
  status: z.enum(['pending', 'correct', 'wrong']),
  numberOfTry: z.number(),
  firstTryAt: z.number().optional(),
});
export const TypingGameGptFeedbackPayloadSchema = z.object({
  result: z.array(TypingGameFeedbackRequestCharacterSchema),
  rawWpm: z.number(),
  rawAccuracy: z.number(),
  finalWpm: z.number(),
  finalAccuracy: z.number(),
});

export const dateSchema = z.object({
  year: z.coerce.number().int().min(1).max(9999),
  month: z.coerce.number().int().min(1).max(12),
  day: z.coerce.number().int().min(1).max(31),
});
export const TreasuryYieldPayloadSchema = z.object({
  from: dateSchema,
  to: dateSchema,
  searchBy: z.number().min(0).max(2),
});
