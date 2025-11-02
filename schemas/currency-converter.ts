import { z } from 'zod';

export const AmountSchema = z.string().trim();

export const CurrencyItemSchema = z.object(
  {
    code: z.string(),
    symbol: z.string(),
    name: z.string(),
    countryKeywords: z.array(z.string()),
    supportsDecimals: z.boolean(),
  },
);

export const RatesItemSchema = z.object(
  {
    rate: z.number(),
    source: z.string(),
    target: z.string(),
    time: z.string(),
  },
);

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
