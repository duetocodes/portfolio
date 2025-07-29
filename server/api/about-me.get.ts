import type { FetchError } from 'ofetch';
import { STRAPI_ENDPOINTS } from '~/server/utils/api';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);

  const fields = ['url', 'alternativeText', 'width', 'height', 'mime'];

  try {
    const response = await $fetch(
      config.strapiApiBase + STRAPI_ENDPOINTS.AboutMe,
      {
        headers: {
          Authorization: `Bearer ${config.strapiReadOnlyToken}`,
        },
        query: {
          ...query,
          'fields': ['aboutMe'],
          'populate[og_banner][populate][image][fields]': fields,
          'populate[avatar_light][populate][image][fields]': fields,
          'populate[hero_light][populate][image][fields]': fields,
          'populate[socialMedia][sort]': 'sortIndex:asc',
        },
        timeout: 7000, // 7 seconds
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
