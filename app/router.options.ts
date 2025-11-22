// https://nuxt.com/docs/3.x/migration/component-options#scrolltotop
// https://router.vuejs.org/api/interfaces/RouterOptions.html#scrollBehavior-
// https://v9.i18n.nuxtjs.org/docs/guide/lang-switcher/#wait-for-page-transition

import type { RouterOptions } from '@nuxt/schema';

export default <RouterOptions>{
  async scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();

    // make sure the route has changed.
    if (nuxtApp.$i18n && to.name !== from.name) {
      // `$i18n` is injected in the `setup` of the nuxtjs/i18n module.
      // `scrollBehavior` is guarded against being called even when it is not completed
      await nuxtApp.$i18n.waitForPendingLocaleChange();
    }

    return savedPosition || { top: 0 };
  },
};
