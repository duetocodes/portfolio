// test secret-keys
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/#test-secret-keys
// 1x0000000000000000000000000000000AA; Always passes validation; Test successful token validation
// 2x0000000000000000000000000000000AA; Always fails validation; Test validation error handling
// 3x0000000000000000000000000000000AA; Returns "token already spent" error; Test duplicate token handling

import type { FetchError } from 'ofetch';
import { CloudflareSiteVerifyResponseSchema, CloudflareSiteVerifyPayloadSchema } from '~~/schemas/cloudflare-turnstile';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // explicitly throw error with .parse (validation failed)
  const body = await readValidatedBody(event, CloudflareSiteVerifyPayloadSchema.parse);

  try {
    const response = await $fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          secret: body.secret || config.turnstileSecretKey,
          response: body.response, // token
        },
      },
    );

    return CloudflareSiteVerifyResponseSchema.parse(response);
  }
  catch (err) {
    const error = err as FetchError;

    throw createError({
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
    });
  }
});
