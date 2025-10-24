import type { FetchError } from 'ofetch';
import type { TreasuryChartRowData } from '~/types';
import { type dateSchema, TreasuryYieldPayloadSchema } from '~/schema';
import type { z } from 'zod';
import {
  CalendarDate,
  parseDate,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
} from '@internationalized/date';

export default defineEventHandler(async (event) => {
  // explicitly throw error with .parse (validation failed)
  const query = await readValidatedBody(event, TreasuryYieldPayloadSchema.parse);

  try {
    if (query.from.year > 2022) {
      // fetch/scrape only
      const data: TreasuryChartRowData[] = await fetchByScraping();
      return getCleanData(query.searchBy, query.from, query.to, data);
    }
    else if (query.to.year <= 2022) {
      // fetch csv only
      const data: TreasuryChartRowData[] = await fetchCsv();
      return getCleanData(query.searchBy, query.from, query.to, data);
    }
    else {
      // fetch both and combine
      return await Promise.all([
        fetchCsv(),
        fetchByScraping(),
      ])
        .then(res => res[0].concat(res[1]))
        .then(data => getCleanData(query.searchBy, query.from, query.to, data));
    }
  }
  catch (err) {
    const error = err as FetchError;

    throw createError({
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
    });
  }
});

// csv
const fetchCsv = async () => {
  return fetch(
    'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rate-archives/par-yield-curve-rates-1990-2022.csv',
    {
      method: 'GET',
    },
  )
    .then(csv => csv.text())
    .then(txt => parseCsvToStructuredData(txt));
};
const parseCsvToStructuredData = (csvText: string) => {
  const lines = (csvText).trim().split('\n');
  const headers = lines[0].split(',');

  // map headers to indices for quick lookup
  const idx = {
    'date': headers.indexOf('Date'),
    '3mth': headers.indexOf('3 Mo'),
    '2yr': headers.indexOf('2 Yr'),
    '10yr': headers.indexOf('10 Yr'),
  };

  const result = lines.slice(1).map((line) => {
    const cells = line.split(',');

    // const localisedDate = new Date(cells[idx.date] ?? '').toLocaleDateString(('en-GB') as string, {
    //   year: 'numeric',
    //   month: 'short',
    //   day: 'numeric',
    // });

    return {
      'date': toIsoString(cells[idx.date]),
      '3mth': toNumber(cells[idx['3mth']]),
      '2yr': toNumber(cells[idx['2yr']]),
      '10yr': toNumber(cells[idx['10yr']]),
    };
  });
  return result;
};

// scrape
const fetchByScraping = async () => {
  const yearNow = new Date().getUTCFullYear();
  const YEAR_TO_SCRAPE_FROM = 2023;
  const ascending = Array.from(
    { length: yearNow - YEAR_TO_SCRAPE_FROM + 1 },
    (_, index) => YEAR_TO_SCRAPE_FROM + index,
  );

  return Promise.all(
    ascending.map(year => getPerYearChartData(year.toString())))
    .then(res => res.flat());
};
const getPerYearChartData = async (year: string) => {
  const BASE_URL = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=';

  // no conditional regex as the web already included all yield data per view
  return $fetch<string>(BASE_URL + year)
    .then((html) => {
      const match = html.match(/<tbody>(.*?)<\/tbody>/s); // extract string between tbody
      const content = match ? match[1].trim() : '';
      const cleaned = content.replace(/\s+/g, ''); // remove all white spaces

      const chartData: TreasuryChartRowData[] = [...cleaned.matchAll(/<tr>(.*?)<\/tr>/g)].map((rowItem) => {
        const date = rowItem[1].match(/<timedatetime="([^"]+)"/g)?.[0]?.match(/datetime="(.*?)"/)?.[1];
        const cell3mth = rowItem[1].match(/<tdclass="bc3monthviews-fieldviews-field-field-bc-3month"headers="view-field-bc-3month-table-column">(.*?)<\/td>/g)?.[0]?.match(/>(.*?)<\/td>/)?.[1];
        const cell2yr = rowItem[1].match(/<tdheaders="view-field-bc-2year-table-column"class="views-fieldviews-field-field-bc-2year">(.*?)<\/td>/g)?.[0]?.match(/>(.*?)<\/td>/)?.[1];
        const cell10yr = rowItem[1].match(/<tdheaders="view-field-bc-10year-table-column"class="views-fieldviews-field-field-bc-10year">(.*?)<\/td>/g)?.[0]?.match(/>(.*?)<\/td>/)?.[1];

        return {
          'date': date?.split('T')[0] ?? '--', // YYYY-MM-DD
          '3mth': Number(cell3mth),
          '2yr': Number(cell2yr),
          '10yr': Number(cell10yr),
        };
      });
      return chartData;
    });
};

// helpers
const getCleanData = (
  searchBy: number,
  calFrom: z.infer<typeof dateSchema>,
  calTo: z.infer<typeof dateSchema>,
  data: TreasuryChartRowData[],
) => {
  const from = new CalendarDate(calFrom.year, calFrom.month, calFrom.day);
  const to = new CalendarDate(calTo.year, calTo.month, calTo.day);
  let startIndex = NaN;
  let endIndex = NaN;

  switch (searchBy) {
    // by year
    case 0: {
      startIndex = findValidStartIndex(startOfYear(from), data);
      endIndex = findValidEndIndex(endOfYear(to), data);
      break;
    }
    // by month
    case 1: {
      startIndex = findValidStartIndex(startOfMonth(from), data);
      endIndex = findValidEndIndex(endOfMonth(to), data);
      break;
    }
    default: break;
  }

  if (startIndex >= 0 && endIndex >= 0) {
    return data.slice(startIndex, endIndex);
  }
  else return null;
};
const toNumber = (value: string): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num; // return 0 for missing values (respecting chart continuity)
};
const toIsoString = (mdyy: string) => {
  if (!mdyy) return '--';
  // expecting 12/25/90 as M/D/YY
  // this is the format in csv
  const [m, d, y] = mdyy.split('/').map(Number);

  // handle 2-digit year — assume 1900s for 90, or 2000s for < current year
  const fullYear = y < 100 ? (y < 50 ? 2000 + y : 1900 + y) : y;

  const formatted = `${fullYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return formatted; // "1990-01-02"
};
const findValidStartIndex = (from: CalendarDate, arr: TreasuryChartRowData[]) => {
  const index = arr.findIndex((obj: TreasuryChartRowData) => {
    const x = parseDate(obj.date);
    return x.year === from.year
      && x.month === from.month
      && x.day === from.day;
  });
  if (index >= 0) return index;

  // Stop if beyond last date in array
  const lastDate = parseDate(arr[arr.length - 1].date);
  if (from.compare(lastDate) > 0) return -1;

  // Try next day
  const next = from.add({ days: 1 });
  return findValidStartIndex(next, arr);
};

const findValidEndIndex = (to: CalendarDate, arr: TreasuryChartRowData[]) => {
  const index = arr.findIndex((obj: TreasuryChartRowData) => {
    const x = parseDate(obj.date);
    return x.year === to.year
      && x.month === to.month
      && x.day === to.day;
  });
  if (index >= 0) return index;

  // limit guard: Stop if earlier than in array
  const firstDate = parseDate(arr[0].date);
  if (to.compare(firstDate) < 0) return -1;

  // Try previous day
  const prev = to.subtract({ days: 1 });
  return findValidEndIndex(prev, arr);
};
