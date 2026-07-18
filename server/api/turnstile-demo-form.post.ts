// test secret-keys
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/#test-secret-keys
// 1x0000000000000000000000000000000AA; Always passes validation; Test successful token validation
// 2x0000000000000000000000000000000AA; Always fails validation; Test validation error handling
// 3x0000000000000000000000000000000AA; Returns "token already spent" error; Test duplicate token handling

import type { FetchError } from 'ofetch';

import {
  CloudflareSiteVerifyResponseSchema,
} from '~~/schemas/cloudflare-turnstile';

import { TurnstileDemoPayloadSchema, TURNSTILE_ACTION } from '~~/schemas/turnstile-demo-form';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // explicitly throw error with .parse (validation failed)
  const body = await readValidatedBody(event, TurnstileDemoPayloadSchema.parse);
  let key = config.turnstileSecretKey;

  if (import.meta.dev) {
    if (body.isSimulateFail)
      key = '3x0000000000000000000000000000000AA';
    else
      key = '1x0000000000000000000000000000000AA';
  }
  else {
    if (body.isSimulateFail)
      key = '3x0000000000000000000000000000000AA';
  }

  try {
    const response = CloudflareSiteVerifyResponseSchema.parse(
      await $fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
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
