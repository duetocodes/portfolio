import type { FetchError } from 'ofetch';
import { CloudflareSiteVerifyPayloadSchema } from '~~/schema-types/cloudflare-turnstile';

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
          secret: config.turnstileSecretKey,
          response: body.response, // token from frontend
          remoteip: body?.remoteip, // optional
        },
      },
    );
    return response; // return everything as-is
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
