import z from 'zod';
import type { FetchError } from 'ofetch';
import { ProjectSchema } from '~~/schema-types/shared';
import { STRAPI_ENDPOINTS } from '~~/server/utils/api';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const schema = z.object({
    locale: z.enum(config.i18nLocaleCodes).default(config.i18nDefaultLocale),
  });
  const query = await getValidatedQuery(event, schema.parse);

  let response: unknown;

  try {
    response = await $fetch(
      config.strapiApiBase + STRAPI_ENDPOINTS.Projects,
      {
        headers: {
          Authorization: `Bearer ${config.strapiReadOnlyToken}`,
        },
        query: {
          ...query,
          sort: 'sortIndex:asc',
          status: 'published',
        },
        timeout: 7000,
      });
  }
  catch (err) {
    const error = err as FetchError;

    throw createError({
      statusCode: error?.statusCode ?? 502,
      statusMessage: error?.statusMessage ?? 'Bad Gateway',
    });
  }

  const result = ProjectSchema.safeParse(response);
  if (!result.success) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
    });
  }
  return result.data;
});
