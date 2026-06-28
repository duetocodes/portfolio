/* eslint-disable nuxt/nuxt-config-keys-order */
// https://nuxt.com/docs/api/configuration/nuxt-config

const i18nDefaultLocale = 'en';

const i18nLocales = [
  { code: 'en', language: 'en', name: 'EN', dir: 'ltr', file: 'en.json', dateLocale: 'en-GB' },
  { code: 'th', language: 'th', name: 'ไทย', dir: 'ltr', file: 'th.json', dateLocale: 'th-TH-u-ca-gregory' }, // for gregory calendar in Thai locale (its Buddhist calendar by default)
  { code: 'tr', language: 'tr', name: 'Türkçe', dir: 'ltr', file: 'tr.json', dateLocale: 'tr' },
  { code: 'zh', language: 'zh', name: '简体中文', dir: 'ltr', file: 'zh.json', dateLocale: 'zh' },
] as const;

const basePrerenderRoutes = [
  '/',
  '/projects',
  '/projects/typing-game',
  '/projects/currency-converter',
  '/projects/treasury-yield-visualiser',
  '/projects/know-your-viewport',
  '/tech-stacks',
] as const;

const prerenderRoutes = i18nLocales.flatMap(({ code }) => {
  if (code === i18nDefaultLocale) {
    return [...basePrerenderRoutes];
  }

  return basePrerenderRoutes.map((route) => {
    return route === '/' ? `/${code}` : `/${code}${route}`;
  });
});

export default defineNuxtConfig({
  ssr: true,
  app: {
    pageTransition: {
      name: 'fade-main',
      mode: 'out-in',
    },
    layoutTransition: {
      name: 'fade-main',
      mode: 'out-in',
    },
  },
  runtimeConfig: {
    strapiReadOnlyToken: import.meta.env.NUXT_STRAPI_READ_ONLY_TOKEN,
    strapiApiBase: import.meta.env.NUXT_STRAPI_API_BASE,
    wiseReadOnlyToken: import.meta.env.NUXT_WISE_READ_ONLY_TOKEN,
    wiseApiBase: import.meta.env.NUXT_WISE_API_BASE,
    openAiSecretKey: import.meta.env.NUXT_OPENAI_API_KEY,
    turnstileSecretKey: import.meta.env.NUXT_TURNSTILE_SECRET_KEY,
    demoTurnstileSecretKey: import.meta.env.NUXT_DEMO_TURNSTILE_SECRET_KEY,

    public: {
      turnstileSiteKey: import.meta.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
      demoTurnstileSiteKey: import.meta.env.NUXT_PUBLIC_DEMO_TURNSTILE_SITE_KEY,
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n', '@nuxtjs/mdc', 'nuxt-charts', '@nuxt/image', '@vueuse/nuxt'],
  devtools: {
    enabled: true,
  },
  nitro: {
    prerender: {
      routes: prerenderRoutes,
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
    baseUrl: 'https://duetocodes.com',
    defaultLocale: i18nDefaultLocale,
    locales: i18nLocales,
    lazy: true,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      cookieKey: 'dtc-pref-locale',
    },
  },
});
