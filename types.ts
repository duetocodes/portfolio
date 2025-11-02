// use types from packages as-is

import type { CalendarDate } from '@internationalized/date';

// see https://github.com/unjs/ufo/blob/main/src/query.ts (not sure how to import these)
export type QueryValue =
  | string
  | number
  | undefined
  | null
  | boolean
  | Array<QueryValue>
  | Record<string, unknown>;
export type QueryObject = Record<string, QueryValue | Array<QueryValue>>;

// https://nuxt.com/docs/3.x/api/composables/use-fetch#type
export type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'

export type PickerTypeRange = {
  start: CalendarDate | null
  end: CalendarDate | null
}
