import { z } from 'zod';

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
