/* eslint-disable nuxt/nuxt-config-keys-order */

import { $fetch } from 'ofetch';
import { STRAPI_ENDPOINTS } from './server/utils/api';
import type { LocaleObject } from '@nuxtjs/i18n';
import type { ProjectSchema } from './schemas';
import type { z } from 'zod';

type Project = z.infer<typeof ProjectSchema>;
type ProjectSlug = Pick<Project, 'id' | 'documentId' | 'slugId' | 'locale'>;

const localeList: LocaleObject[] = [
  { code: 'en', name: 'EN', dir: 'ltr', file: 'en.json', dateLocale: 'en-GB' },
  { code: 'th', name: 'ไทย', dir: 'ltr', file: 'th.json', dateLocale: 'th-TH-u-ca-gregory' }, // for gregory calendar in Thai locale (its Buddhist calendar by default)
  { code: 'tr', name: 'Türkçe', dir: 'ltr', file: 'tr.json', dateLocale: 'tr' },
  { code: 'zh', name: '简体中文', dir: 'ltr', file: 'zh.json', dateLocale: 'zh' },
];

const fetchPublishedProjectSlugs = async (locale: string) => {
  return $fetch(
    process.env.NUXT_STRAPI_API_BASE + STRAPI_ENDPOINTS.Projects,
    {
      headers: {
        Authorization: `Bearer ${process.env.NUXT_STRAPI_READ_ONLY_TOKEN}`,
      },
      query: {
        locale: locale,
        fields: ['slugId', 'locale'],
      },
    },
  ).then((res: { data: ProjectSlug[] }) => res.data);
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    // layoutTransition: { name: 'layout', mode: 'out-in' }, // un-comment when additional layouts are being used
  },
  runtimeConfig: {
    strapiReadOnlyToken: process.env.NUXT_STRAPI_READ_ONLY_TOKEN,
    strapiApiBase: process.env.NUXT_STRAPI_API_BASE,
    wiseReadOnlyToken: process.env.NUXT_WISE_READ_ONLY_TOKEN,
    wiseApiBase: process.env.NUXT_WISE_API_BASE,
    turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY,
    openAiSecretKey: process.env.NUXT_OPENAI_API_KEY,

    public: {
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n', '@nuxtjs/mdc', 'nuxt-charts', '@nuxt/image', '@vueuse/nuxt'],
  devtools: {
    enabled: true,
  },
  routeRules: {
    '/**': {
      prerender: true,
    },
  },
  css: ['~/assets/css/main.css'],
  image: {
    format: ['webp', 'png'],
    provider: 'vercel',
    domains: ['thoughtful-bracelet-33c79aabd8.media.strapiapp.com'],
    screens: {
      myAvatar: 120,
      myAvatar2x: 240,
    },
  },
  compatibilityDate: '2024-11-01',
  icon: {
    clientBundle: {
      scan: true, // pre-render explicitly used icons from installed @iconify-json/* packages
      icons: [ // icons rendered dynamically
        'simple-icons:github',
        'simple-icons:linkedin',
        'simple-icons:twitter',
        'simple-icons:instagram',
      ],
    },
  },
  eslint: {
    config: {
      stylistic: true, // includes @stylistic/eslint-plugin etc.
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: localeList,
    lazy: true,
    strategy: 'prefix_except_default',
  },
  hooks: {
    // https://nuxt.com/docs/3.x/getting-started/prerendering#prerenderroutes-nuxt-hook
    async 'prerender:routes'(ctx) {
      const locales = localeList.map((loc: LocaleObject) => loc.code);

      locales.forEach(async (loc) => {
        // to accomodate [slugId].vue, published/draft status is set for each locale individually
        const response = await fetchPublishedProjectSlugs(loc);

        response.forEach((slug: ProjectSlug) => {
          const prefix = loc === 'en' ? '' : `/${loc}`;
          ctx.routes.add(`${prefix}/projects/${slug.slugId}`);
        });
      });
    },
  },
});
