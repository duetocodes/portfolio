import OpenAI from 'openai';
import type { FetchError } from 'ofetch';
import type { typingGameGptFeedbackPayload } from '~/types';

const config = useRuntimeConfig();

const openai = new OpenAI({
  apiKey: config.openAiSecretKey,
});

export default defineEventHandler(async (event) => {
  const body = await readBody<typingGameGptFeedbackPayload>(event);
  const result = body?.result ? JSON.stringify(body.result) : 'no data';

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'system',
          content: `
            You are a typing coach. 
            Respond in 15-35 words, written in British English. 
            Keep feedback simple, clear, and actionable. 
            Avoid excessive encouragement — focus on pointing out patterns and giving practical suggestions for improvement.
            When mentioning keys or characters, wrap them in inline code using backticks (for example: \`i\`, \`d\`, \`space\`).
            - Raw accuracy measures how accurately user typed on user's first attempt, without corrections.
            - Raw WPM (words per minute) is calculated based on Raw accuracy.
            - Final accuracy measures user's overall accuracy after corrections, based on the final submitted text.
            - Final WPM (words per minute) is calculated base on Final accuracy.
          `,
        },
        {
          role: 'user',
          content: `
            Here is a typing test result:
            - Results on key pressed: ${result}
            - Raw accuracy:  ${body?.rawAccuracy}
            - Raw WPM: ${body?.rawWpm}
            - Final accuracy: ${body?.finalAccuracy}
            - Final WPM: ${body?.finalWpm}
          `,
        },
      ],
    });

    if (response.error) {
      throw createError({
        statusCode: Number(response.error?.code) || 500,
        statusMessage: response.error?.message || 'UnexpectedErrorOccurred',
      });
    }
    else {
      const normalised = response.output_text
        .replace(/\n\n+/g, '\n')
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, `'`);

      return {
        feedback: normalised.trim(),
      };
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
