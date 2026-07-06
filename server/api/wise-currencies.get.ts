// https://docs.wise.com/api-docs/api-reference/currencies
import type { FetchError } from 'ofetch';
import { WISE_SANDBOX_ENDPOINTS } from '~~/server/utils/api';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  try {
    const response = await $fetch(
      config.wiseSandboxApiBase + WISE_SANDBOX_ENDPOINTS.Currencies,
      {
        headers: {
          Authorization: `Bearer ${config.wiseSandboxReadOnlyToken}`,
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
