// .refine() at client side to add custom error message

import { z } from 'zod';

const dateSchema = z.object({
  year: z.coerce.number().int().min(1).max(9999),
  month: z.coerce.number().int().min(1).max(12), // conforming @internationalized/date
  day: z.coerce.number().int().min(1).max(31),
});

export const ImageDataSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  name: z.string(),
  ext: z.string(),
  mime: z.string(),
  size: z.number(),
  width: z.number(),
  height: z.number(),
  provider: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  alternativeText: z.string(),
});
export const TechStackResponseSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  website: z.string().url(),
  purpose: z.string(),
  logo: ImageDataSchema,
});

export const AvatarImageSchema = z.object({
  documentId: z.string(),
  name: z.string(),
  alternativeText: z.string(),
  width: z.number(),
  height: z.number(),
  mime: z.enum(['image/jpeg', 'image/gif', 'image/png']),
  size: z.number(),
  url: z.string().url(),
});
const AvatarSchema = z.object({
  id: z.number(),
  image: AvatarImageSchema,
});

export const SocialMediaItemSchema = z.object({
  id: z.number(),
  sortIndex: z.number(),
  platform: z.string(),
  type: z.enum(['personal', 'work']),
  url: z.string().url(),
  icon: z.string(),
  description: z.string().nullable(),
});

export const AboutMeResponseSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  aboutMe: z.string().nullable(),
  og_banner: AvatarSchema,
  avatar_light: AvatarSchema,
  avatar_dark: AvatarSchema,
  hero_light: AvatarSchema,
  hero_dark: AvatarSchema,
  socialMedia: z.array(SocialMediaItemSchema),
});

export const ProjectSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  description: z.string(),
  tag: z.string(),
  sortIndex: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  identifier: z.string(),
});

export const ProjectItemDataSchema = z.object({
  description: z.string(),
  preview: z.object({
    image: AvatarImageSchema,
  }),
});

// treasury yield visualiser
export type TreasuryChartRowData = {
  'date': string
  '3mth': number
  '2yr': number
  '10yr': number
};
export const TreasuryChartRowDataSchema = z.object({
  'date': z.string(),
  '3mth': z.number(),
  '2yr': z.number(),
  '10yr': z.number(),
});

// typing game
export const CharacterSchema = z.object({
  char: z.string(),
  display: z.string(),
  expectedKey: z.string(),
  lastTypedKey: z.string().optional(),
  status: z.enum(['pending', 'correct', 'wrong']),
  numberOfTry: z.number(),
  firstTryAt: z.number().optional(),
});
export const TypingGameSchema = z.object({
  hasFocus: z.boolean(),
  timerId: z.number(),
  timeLeft: z.number(),
  status: z.enum(['standby', 'playing', 'gameover']),
});
export const TypingGameStatsSchema = z.object({
  rawWpm: z.number(),
  rawAccuracy: z.number(),
  finalWpm: z.number(),
  finalAccuracy: z.number(),
});
export const TypingGameUpdatedDataSchema = z.object({
  id: z.string(),
  topic: z.string(),
  mappedPassage: z.array(CharacterSchema),
});
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

export const TreasuryYieldPayloadSchema = z.object({
  from: dateSchema,
  to: dateSchema,
  searchBy: z.number().min(0).max(1),
});

// currency converter
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
