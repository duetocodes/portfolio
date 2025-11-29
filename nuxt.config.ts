/* eslint-disable nuxt/nuxt-config-keys-order */

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  runtimeConfig: {
    strapiReadOnlyToken: import.meta.env.NUXT_STRAPI_READ_ONLY_TOKEN,
    strapiApiBase: import.meta.env.NUXT_STRAPI_API_BASE,
    wiseReadOnlyToken: import.meta.env.NUXT_WISE_READ_ONLY_TOKEN,
    wiseApiBase: import.meta.env.NUXT_WISE_API_BASE,
    turnstileSecretKey: import.meta.env.NUXT_TURNSTILE_SECRET_KEY,
    openAiSecretKey: import.meta.env.NUXT_OPENAI_API_KEY,

    public: {
      turnstileSiteKey: import.meta.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
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
    locales: [
      { code: 'en', name: 'EN', dir: 'ltr', file: 'en.json', dateLocale: 'en-GB' },
      { code: 'th', name: 'ไทย', dir: 'ltr', file: 'th.json', dateLocale: 'th-TH-u-ca-gregory' }, // for gregory calendar in Thai locale (its Buddhist calendar by default)
      { code: 'tr', name: 'Türkçe', dir: 'ltr', file: 'tr.json', dateLocale: 'tr' },
      { code: 'zh', name: '简体中文', dir: 'ltr', file: 'zh.json', dateLocale: 'zh' },
    ],
    lazy: true,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      cookieKey: 'dtc-pref-locale',
    },
  },
});
