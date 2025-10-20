import type { FetchError } from 'ofetch';
import type { TreasuryChartRowData } from '~/types';
import type { QueryValue } from 'ufo';
import { z } from 'zod';

const dateSchema = z.object({
  year: z.coerce.number().int().min(1).max(9999),
  month: z.coerce.number().int().min(1).max(12),
  day: z.coerce.number().int().min(1).max(31),
});

// by year = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2023'
// by month = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value_month=202306'
const BASE_URL = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=';

export default defineEventHandler(async (event) => {
  const querySchema = z.object({
    from: dateSchema,
    to: dateSchema,
    dateLocale: z.string().optional(),
  });

  const query = await readValidatedBody(event, querySchema.parse);

  const ascendingSorted = Array.from(
    { length: Number(query.to.year) - Number(query.from.year) + 1 },
    (_, index) => String(Number(query.from.year) + index),
  );

  try {
    const chartData = await Promise.all(ascendingSorted.map(year => getPerYearChartData(year, query.dateLocale)));
    return chartData.flat();
  }
  catch (err) {
    const error = err as FetchError;

    throw createError({
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
    });
  }
});

const getPerYearChartData = async (year: string, dateLocale: QueryValue) => {
  // no conditional regex as the web already included all yield data per view
  return $fetch<string>(BASE_URL + year)
    .then((html) => {
      const match = html.match(/<tbody>(.*?)<\/tbody>/s); // extract string between tbody
      const content = match ? match[1].trim() : '';
      const cleaned = content.replace(/\s+/g, ''); // remove all white spaces

      const chartData = [...cleaned.matchAll(/<tr>(.*?)<\/tr>/g)].map((rowItem): TreasuryChartRowData => {
        const date = rowItem[1].match(/<timedatetime="([^"]+)"/g)?.[0]?.match(/datetime="(.*?)"/)?.[1];
        const cell3mth = rowItem[1].match(/<tdclass="bc3monthviews-fieldviews-field-field-bc-3month"headers="view-field-bc-3month-table-column">(.*?)<\/td>/g)?.[0]?.match(/>(.*?)<\/td>/)?.[1];
        const cell2yr = rowItem[1].match(/<tdheaders="view-field-bc-2year-table-column"class="views-fieldviews-field-field-bc-2year">(.*?)<\/td>/g)?.[0]?.match(/>(.*?)<\/td>/)?.[1];
        const cell10yr = rowItem[1].match(/<tdheaders="view-field-bc-10year-table-column"class="views-fieldviews-field-field-bc-10year">(.*?)<\/td>/g)?.[0]?.match(/>(.*?)<\/td>/)?.[1];

        const formattedDate = new Date(date ?? '').toLocaleDateString((dateLocale || 'en-GB') as string, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return {
          'date': formattedDate,
          '3mth': Number(cell3mth),
          '2yr': Number(cell2yr),
          '10yr': Number(cell10yr),
        };
      });
      return chartData;
    });
};
