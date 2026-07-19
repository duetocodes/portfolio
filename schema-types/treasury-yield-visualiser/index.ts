import { z } from 'zod';
import { CalendarDateValueSchema } from '../shared';

export const TreasuryChartRowDataSchema = z.object({
  'date': z.string(),
  '3mth': z.number(),
  '2yr': z.number(),
  '10yr': z.number(),
});
export type TreasuryChartRowData = z.infer<typeof TreasuryChartRowDataSchema>;

export const TreasuryYieldPayloadSchema = z.object({
  from: CalendarDateValueSchema,
  to: CalendarDateValueSchema,
  searchBy: z.number().min(0).max(1),
});
export type TreasuryYieldPayload = z.infer<typeof TreasuryYieldPayloadSchema>;
