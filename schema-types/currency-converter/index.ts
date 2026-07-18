import { z } from 'zod';

export const AmountSchema = z.string().trim();
export type Amount = z.infer<typeof AmountSchema>;

export const CurrencyItemSchema = z.object(
  {
    code: z.string(),
    symbol: z.string(),
    name: z.string(),
    countryKeywords: z.array(z.string()),
    supportsDecimals: z.boolean(),
  },
);
export type CurrencyItem = z.infer<typeof CurrencyItemSchema>;

export const RatesItemSchema = z.object(
  {
    rate: z.number(),
    source: z.string(),
    target: z.string(),
    time: z.string(),
  },
);
export type RatesItem = z.infer<typeof RatesItemSchema>;

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
export type CurrencySelect = z.infer<typeof CurrencySelectSchema>;
