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
export type Character = z.infer<typeof CharacterSchema>;

export const TypingGameSchema = z.object({
  hasFocus: z.boolean(),
  timerId: z.number(),
  timeLeft: z.number(),
  status: z.enum(['standby', 'playing', 'gameover']),
});
export type TypingGame = z.infer<typeof TypingGameSchema>;

export const TypingGameStatsSchema = z.object({
  rawWpm: z.number(),
  rawAccuracy: z.number(),
  finalWpm: z.number(),
  finalAccuracy: z.number(),
});
export type TypingGameStats = z.infer<typeof TypingGameStatsSchema>;

export const TypingGameUpdatedDataSchema = z.object({
  id: z.string(),
  topic: z.string(),
  mappedPassage: z.array(CharacterSchema),
});
export type TypingGameUpdatedData = z.infer<typeof TypingGameUpdatedDataSchema>;

export const TypingGameFeedbackRequestCharacterSchema = z.object({
  expectedKey: z.string(),
  lastTypedKey: z.string().optional(),
  status: z.enum(['pending', 'correct', 'wrong']),
  numberOfTry: z.number(),
  firstTryAt: z.number().optional(),
});
export type TypingGameFeedbackRequestCharacter = z.infer<typeof TypingGameFeedbackRequestCharacterSchema>;

export const TypingGameGptFeedbackPayloadSchema = z.object({
  result: z.array(TypingGameFeedbackRequestCharacterSchema),
  rawWpm: z.number(),
  rawAccuracy: z.number(),
  finalWpm: z.number(),
  finalAccuracy: z.number(),
});
export type TypingGameGptFeedbackPayload = z.infer<typeof TypingGameGptFeedbackPayloadSchema>;
