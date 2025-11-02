import { z } from 'zod';
import { dateSchema } from './index';

export const TreasuryChartRowDataSchema = z.object({
  'date': z.string(),
  '3mth': z.number(),
  '2yr': z.number(),
  '10yr': z.number(),
});

export const TreasuryYieldPayloadSchema = z.object({
  from: dateSchema,
  to: dateSchema,
  searchBy: z.number().min(0).max(1),
});
