// https://nuxt.com/docs/3.x/migration/component-options#scrolltotop
// https://router.vuejs.org/api/interfaces/RouterOptions.html#scrollBehavior-
// https://v9.i18n.nuxtjs.org/docs/guide/lang-switcher/#wait-for-page-transition

import type { RouterConfig } from '@nuxt/schema';

export default {
  async scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
} satisfies RouterConfig;
