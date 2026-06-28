import type { FetchError } from 'ofetch';

import {
  CloudflareSiteVerifyResponseSchema,
} from '~~/schemas/cloudflare-turnstile';

import { TurnstileDemoPayloadSchema, TURNSTILE_ACTION } from '~~/schemas/turnstile-demo-form';

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

    // when using test keys on localhost
    if (response?.metadata?.result_with_testing_key)
      return response;

    // when in production
    // SiteVerify should return the same `action` for the same token
    // https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
    if (response?.action === TURNSTILE_ACTION) {
      return {
        'success': response.success,
        'challenge_ts': response.challenge_ts,
        'error-codes': response['error-codes'],
        'hostname': response.hostname,
      };
    }
    else {
      // insist visible ui in production
      return {
        'success': false,
        'challenge_ts': response.challenge_ts,
        'error-codes': ['simulating-server-side-failure'],
        'hostname': response.hostname,
      };
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

// Production side complete response from Site Verify
// {
//   "success": true,
//   "challenge_ts": "2026-06-28T04:12:36.000Z",
//   "error-codes": [],
//   "action": "demo",
//   "cdata": "",
//   "hostname": "portfolio-9vasi74dn-duetocodes-projects.vercel.app",
//   "metadata": {}
// }
