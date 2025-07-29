// https://nuxt.com/docs/3.x/migration/component-options#scrolltotop
// https://router.vuejs.org/api/interfaces/RouterOptions.html#scrollBehavior-

import type { RouterOptions } from '@nuxt/schema';

export default <RouterOptions>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    else {
      setTimeout(() => {
        return {
          top: 0,
        };
      });
    }
  },
};
