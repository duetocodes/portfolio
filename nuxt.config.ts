/* eslint-disable nuxt/nuxt-config-keys-order */

const prodHeadersCsp = `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.vercel-insights.com; frame-src https://challenges.cloudflare.com;`;
const previewHeadersCsp = `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.vercel-insights.com https://vercel.live; frame-src https://challenges.cloudflare.com https://vercel.live;`;

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
      headers: {
        'Content-Security-Policy': previewHeadersCsp,
      },
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
      icons: [
        'material-symbols:app-badging-outline',
        'material-symbols:chart-data-outline',
        'material-symbols:moon-stars-outline-rounded',
        'material-symbols:arrow-outward-rounded',
        'material-symbols:sunny-outline-rounded',
        'material-symbols:link-rounded',
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
      { code: 'en', name: 'EN', dir: 'ltr', file: 'en.json' },
      { code: 'th', name: 'ไทย', dir: 'ltr', file: 'th.json' },
      { code: 'tr', name: 'Türkçe', dir: 'ltr', file: 'tr.json' },
      { code: 'zh', name: '简体中文', dir: 'ltr', file: 'zh.json' },
    ],
    lazy: true,
    strategy: 'prefix', // locale prefix added for all locale
  },
});
