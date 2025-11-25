// https://nuxt.com/docs/3.x/migration/component-options#scrolltotop
// https://router.vuejs.org/api/interfaces/RouterOptions.html#scrollBehavior-
// https://v9.i18n.nuxtjs.org/docs/guide/lang-switcher/#wait-for-page-transition

import type { RouterOptions } from '@nuxt/schema';

export default <RouterOptions>{
  async scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
};
