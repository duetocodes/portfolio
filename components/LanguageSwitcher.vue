<template>
  <UPopover
    v-model:open="open"
    arrow>
    <UButton
      :label="dropDownLabel"
      :aria-label="dropDownLabel"
      class="text-md md:text-lg text-muted"
      size="xl"
      color="neutral"
      variant="ghost" />

    <template #content>
      <div class="py-2 text-center flex flex-col">
        <ULink
          v-for="item in localeItems"
          :key="item.code"
          class="w-24 py-2 text-md md:text-lg text-accented"
          :to="item.to"
          :aria-label="item.name"
          @click="open = false">
          {{ item.name }}
        </ULink>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const nuxtApp = useNuxtApp();
const switchLocalePath = useSwitchLocalePath();
const {
  locale,
  locales,
  finalizePendingLocaleChange,
} = useI18n();

const open = ref(false);

const dropDownLabel = computed(() => locales.value.find(lang => lang.code === locale.value)?.name || locale.value);

const localeItems = computed<DropdownMenuItem[]>(() => {
  const filtered = locales.value.filter(lang => lang.code !== locale.value);

  return filtered.map(lang => ({
    ...lang,
    label: lang.name,
    to: switchLocalePath(lang.code),
  }));
});

const localeCookie = useCookie(
  nuxtApp.$config.public.i18n.detectBrowserLanguage.cookieKey,
  {
    maxAge: 60 * 60 * 24 * 14, // 14 days in seconds
    sameSite: 'lax',
    path: '/', // all routes
  },
);

nuxtApp.hook('page:loading:end', async () => {
  finalizePendingLocaleChange();
  localeCookie.value = locale.value;
});
</script>
