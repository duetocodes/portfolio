import type { FetchError } from 'ofetch';

import {
  CloudflareSiteVerifyResponseSchema,
} from '~~/schemas/cloudflare-turnstile';

import { TurnstileDemoPayloadSchema } from '~~/schemas/turnstile-demo-form';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // explicitly throw error with .parse (validation failed)
  const body = await readValidatedBody(event, TurnstileDemoPayloadSchema.parse);
  const key = body.isSimulateFail ? config.demoTurnstileSecretKey : config.turnstileSecretKey;

  try {
    const response = CloudflareSiteVerifyResponseSchema.parse(
      await $fetch(
        '/api/cloudflare-turnstile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            secret: key,
            response: body.token,
          },
        },
      ),
    );

    // when on localhost
    // if (response?.metadata?.result_with_testing_key)
    return response;

    // when in production
    // ensure matching form vs token
    // if (response?.action === body?.action) {
    //   return {
    //     'success': response.success,
    //     'challenge_ts': response.challenge_ts,
    //     'error-codes': response['error-codes'],
    //   };
    // }
    // else {
    //   throw createError({
    //     statusCode: 400,
    //     statusMessage: 'Bad Request',
    //   });
    // }
  }
  catch (err) {
    const error = err as FetchError;

    throw createError({
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
    });
  }
});
