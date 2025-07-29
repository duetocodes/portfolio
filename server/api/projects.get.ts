import type { FetchError } from 'ofetch';
import { STRAPI_ENDPOINTS } from '~/server/utils/api';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);

  try {
    const response = await $fetch(
      config.strapiApiBase + STRAPI_ENDPOINTS.Projects,
      {
        headers: {
          Authorization: `Bearer ${config.strapiReadOnlyToken}`,
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
