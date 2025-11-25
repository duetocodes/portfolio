export default defineNuxtPlugin((nuxtApp) => {
  const localeCookie = useCookie(
    nuxtApp.$config.public.i18n.detectBrowserLanguage.cookieKey,
    {
      maxAge: 60 * 60 * 24 * 14, // 14 days in seconds
      sameSite: 'lax',
      path: '/', // all routes
    },
  );

  if (!localeCookie.value) {
    localeCookie.value = nuxtApp.$config.public.i18n.defaultLocale;
  }
});
