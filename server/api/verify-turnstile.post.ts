import type { FetchError } from 'ofetch';
import type { TurnstileResponse } from '@@/types';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token: string }>(event);
  const config = useRuntimeConfig();

  if (!body.token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing token',
    });
  }

  // Send token to Cloudflare
  try {
    const response = await $fetch<{ success: boolean }>(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({
          secret: config.turnstileSecretKey,
          response: body.token,
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (response.success) {
      return { success: true } as TurnstileResponse;
    }
    else {
      throw createError({
        statusCode: 403,
        statusMessage: 'Verification Failed',
      });
    }
  }
  catch (err) {
    const error = err as FetchError;

    throw createError({
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
    });
  };
});
