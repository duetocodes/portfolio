// .refine() at client side to add custom error message

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
  searchBy: z.number().min(0).max(1),
});

export const AmountSchema = z.string().trim();

export const CurrencySelectSchema = z.object(
  {
    label: z.string(),
    value: z.string(),
    avatar: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    code: z.string(),
    symbol: z.string(),
    name: z.string(),
    countryKeywords: z.array(z.string()),
    supportsDecimals: z.boolean(),
  },
);
