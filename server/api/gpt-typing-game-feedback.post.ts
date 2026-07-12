import OpenAI from 'openai';
import type { FetchError } from 'ofetch';
import { TypingGameGptFeedbackPayloadSchema } from '~~/schemas/typing-game';

const config = useRuntimeConfig();

const openai = new OpenAI({
  apiKey: config.openAiSecretKey,
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, TypingGameGptFeedbackPayloadSchema.parse);
  const result = body?.result ? JSON.stringify(body.result) : 'no data';

  try {
    const response = await openai.responses.create({
      model: 'gpt-5.4',
      input: [
        {
          role: 'system',
          content: `
            You are an experienced typing coach.
            Write feedback in 15-35 words using British English.

            The feedback should:
            - Use a supportive, constructive tone.
            - Be clear, concise, and actionable.
            - Suggest one practical improvement.
            - Avoid excessive encouragement, filler, or generic praise.

            Prioritise information in this order:
            1. Repeated key press mistakes.
            2. Raw accuracy.
            3. Final accuracy.
            4. WPM.

          Interpret the metrics as follows:
          - Raw accuracy measures how accurately the user typed on their first attempt, before any corrections.
          - Raw WPM is calculated from raw accuracy.
          - Final accuracy measures the accuracy of the submitted text after corrections.
          - Final WPM is calculated from final accuracy.

          If key press analysis is "no data", base the feedback on the metrics instead.
          If raw accuracy is much lower than final accuracy, point out that the user is relying on corrections.
          If repeated mistakes involve one or more keys, mention only the most significant ones.
          Do not mention every metric.
          Do not simply repeat the numbers.
          Only mention metrics that support your coaching.
          When mentioning keyboard keys or characters, wrap them in triple asterisks (for example: ***t***, ***D***, ***Space***).
          Return only the feedback sentence. Do not add labels, headings, explanations, quotation marks, or markdown.
          `,
        },
        {
          role: 'user',
          content: `
            Typing test results
            Key press analysis: ${result}
            Metrics:
            - Raw accuracy: ${body.rawAccuracy}%
            - Raw WPM: ${body.rawWpm}
            - Final accuracy: ${body.finalAccuracy}%
            - Final WPM: ${body.finalWpm}
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
