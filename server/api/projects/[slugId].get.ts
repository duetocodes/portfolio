import z from 'zod';
import type { FetchError } from 'ofetch';
import { ProjectItemDataSchema, ProjectSlugIDSchema } from '~~/schema-types/shared';
import { STRAPI_ENDPOINTS } from '~~/server/utils/api';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const querySchema = z.object({
    locale: z.enum(config.i18nLocaleCodes).default(config.i18nDefaultLocale),
  });
  const paramsSchema = z.object({
    slugId: ProjectSlugIDSchema,
  });

  const query = await getValidatedQuery(event, querySchema.parse);
  const { slugId } = await getValidatedRouterParams(event, paramsSchema.parse);

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
          'filters[slugId][$eq]': slugId,
          'fields': 'description',
          'populate': '*',
          'status': 'published',
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

  const result = ProjectItemDataSchema.safeParse(response);
  if (!result.success) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
    });
  }
  return result.data;
});
