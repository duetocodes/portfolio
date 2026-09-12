import z from 'zod';
import type { FetchError } from 'ofetch';
import { STRAPI_ENDPOINTS } from '~~/server/utils/api';
import { AboutMeResponseSchema } from '~~/schema-types/shared';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const schema = z.object({
    locale: z.enum(config.i18nLocaleCodes).default(config.i18nDefaultLocale),
  });
  const query = await getValidatedQuery(event, schema.parse);

  let response: unknown;

  try {
    response = await $fetch(
      config.strapiApiBase + STRAPI_ENDPOINTS.AboutMe,
      {
        headers: {
          Authorization: `Bearer ${config.strapiReadOnlyToken}`,
        },
        query: {
          ...query,
          'status': 'published',
          'populate[heroImage]': '*',
          'populate[meImage]': '*',
          'populate[socialMedia][sort]': 'sortIndex:asc',
        },
        timeout: 7000, // 7 seconds
      });
  }
  catch (err) {
    const error = err as FetchError;

    throw createError({
      statusCode: error?.statusCode ?? 502,
      statusMessage: error?.statusMessage ?? 'Bad Gateway',
    });
  }

  const result = AboutMeResponseSchema.safeParse(response);
  if (!result.success) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
    });
  }
  return result.data;
});
