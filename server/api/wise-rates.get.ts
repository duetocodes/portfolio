// https://docs.wise.com/api-docs/api-reference/rate
import type { FetchError } from 'ofetch';
import { WISE_ENDPOINTS } from '~/server/utils/api';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);

  try {
    const response = await $fetch(
      config.wiseApiBase + WISE_ENDPOINTS.Rates,
      {
        headers: {
          Authorization: `Bearer ${config.wiseReadOnlyToken}`,
        },
        query: {
          ...query,
        },
        timeout: 7000,
      });
    return response;
  }
  catch (err) {
    const error = err as FetchError;

    throw createError({
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
    });
  }
});
