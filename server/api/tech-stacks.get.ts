import type { FetchError } from 'ofetch';
import { STRAPI_ENDPOINTS } from '~/server/utils/api';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);

  try {
    const response = await $fetch(
      config.strapiApiBase + STRAPI_ENDPOINTS.TechStacks,
      {
        headers: {
          Authorization: `Bearer ${config.strapiReadOnlyToken}`,
        },
        query: {
          ...query,
          // all fields here are top-level
          'sort': 'sortIndex:asc',
          'fields': ['name', 'description', 'website'],
          'populate[icon_default][fields]': ['url', 'alternativeText'],
          'populate[icon_dark][fields]': ['url', 'alternativeText'],
          'populate[tech_stack_tags]populate[fields]': ['tag', 'description'],
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
