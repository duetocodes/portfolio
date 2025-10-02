import OpenAI from 'openai';
import type { FetchError } from 'ofetch';
import type { Character } from '~/types';

const config = useRuntimeConfig();

const openai = new OpenAI({
  apiKey: config.openAiSecretKey,
});

export default defineEventHandler(async () => {
  const topic = getRandomTopic();

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      input: [
        {
          role: 'system',
          content: 'You are a typing test generator. You produce short, natural passages for users to type. Always use British English spelling.',
        },
        {
          role: 'user',
          content: `Generate a typing test passage for a 60-second English typing app.
          - Topic: ${topic}.
          - Length of about 80-100 words.
          - Keep it easy to understand but varied for typing practice. 
          - Split text into 2-3 short paragraphs.
          - Only use plain keyboard characters (ASCII).
          - Do not use numbers.
          - Do not add any explanation, labels, or extra text. Return only the passage text.`,
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
      const mapped = passageMapper(textNormaliser(response.output_text || ''));

      const data = {
        id: response.id,
        topic,
        mappedPassage: mapped,
      };

      return data;
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

const textNormaliser = (txt: string) => {
  const normalised = (txt || '').replace(/ *\n\n+/g, '\n')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, `'`);

  return normalised.trim();
};

const passageMapper = (txt: string) => {
  const split = (txt || '').split('');

  const mapped = split.map((char: string): Character => {
    const isNewline = char === '\n';
    return {
      char,
      display: isNewline ? '↵\n' : char,
      expectedKey: isNewline ? 'Enter' : char,
      lastTypedKey: undefined,
      status: 'pending',
      numberOfTry: 0,
      firstTryAt: undefined,
    };
  });
  return mapped;
};

const getRandomTopic = () => {
  const topics = [
    'Vue.js framework',
    'Nuxt.js framework',
    'Tailwind CSS',
    'Content Management System',
    'Touch typing',
    'Nature',
    'Animals',
    'Cats',
    'Sea creatures',
    'Travel',
    'Sports',
    'Geography',
    'Music',
    'Movies',
    'Science Fiction',
    'Space Exploration',
    'World Peace',
    'Colours',
    'Home Decoration',
    'Food and Beverages',
    'Clothing and Apparels',
    'Technology Gadgets',
    'Sleep',
    'Health and Wellness',
    'Style and Beauty',
    'Personal Finances',
    'Business',
    'Mental Health',
    'Weather',
    'Economy',
    'Cars',
    'Motorcycles',
    'Books and Literature',
    'Space and Astronomy',
    'Seasons',
    'Ocean Life',
    'Mountains and Hiking',
    'Transportation',
    'Inventions',
    'Art and Creativity',
    'Childhood Memories',
    'Cooking and Baking',
    'Festivals and Celebrations',
    'Gardening',
    'Pets',
    'Adventure',
    'Dreams and Imagination',
    'Zodiac',
  ];

  const index = Math.floor(Math.random() * topics.length);
  return topics[index];
};
