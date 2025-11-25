export default defineNuxtPlugin((nuxtApp) => {
  const localeCookie = useCookie(
    nuxtApp.$config.public.i18n.detectBrowserLanguage.cookieKey,
    {
      sameSite: 'lax',
      path: '/', // all routes
    },
  );

  if (!localeCookie.value) {
    localeCookie.value = nuxtApp.$config.public.i18n.defaultLocale || 'en';
  }
});
