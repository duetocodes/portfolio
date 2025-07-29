<template>
  <UApp>
    <header class="h-[var(--app-header-height)] grid px-4 sm:px-6 fixed z-50 w-full top-0 shadow backdrop-blur-lg">
      <div class="mx-auto w-full flex justify-between max-w-5xl">
        <div
          v-if="activePage"
          class="sm:hidden flex gap-x-4">
          <span class="flex items-center font-semibold text-md text-muted">
            {{ $t(activePage) }}
          </span>
        </div>

        <UNavigationMenu
          :items="menuItems"
          class="hidden sm:flex"
          :ui="{
            list: 'gap-4',
            item: 'py-0',
            link: 'text-md md:text-lg',
          }">
          <template #item="{ item }">
            <UIcon
              :name="item.icon ?? ''"
              class="size-5 shrink-0" />
            {{ item.label }}
          </template>
        </UNavigationMenu>

        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <ColorModeSwitch />
        </div>
      </div>
    </header>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <footer
      class="
        sm:hidden w-[90svw]
        fixed bottom-4 left-1/2 -translate-x-1/2
        flex justify-evenly
        overflow-hidden">
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        class="
        first:rounded-s-full last:rounded-e-full
        inset-ring-2
        basis-1/3 overflow-clip
        backdrop-blur-xl transition"
        :class="[item.active ? 'inset-ring-[var(--ui-primary)]/25' : 'inset-ring-[var(--ui-border-muted)]/40']">
        <UButton
          class="group w-full transition rounded-none"
          size="xl"
          :color="item.active ? 'primary' : 'neutral'"
          :variant="item.active ? 'soft' : 'ghost'"
          :icon="item.icon"
          :to="item.to"
          :label="item.label"
          :aria-label="item.label"
          :ui="{
            label: 'max-w-24 truncate leading-none',
            base: [
              'gap-0.5 flex flex-col text-center text-sm transition-color font-semibold',
              item.active ? 'text-primary' : 'text-muted',
            ],
          }" />
      </div>
    </footer>
  </UApp>
  <Analytics />
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
import type { NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();

const localePath = useLocalePath();

const { t: $t, locale, locales } = useI18n();

const lang = computed(() => locale.value);

const dir = computed(() => {
  const selected = locales.value.find(lang => lang.code === locale.value);
  return selected?.dir;
});

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
  link: [
    {
      rel: 'canonical',
      href: `https://duetocodes.com${route.fullPath}`,
    },
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico?v=3', // increment this when favicon changes
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png?v=3',
    },
  ],
});

const activePage = ref<string>('');

watch(
  () => route.fullPath,
  (val) => {
    const arrayed = (val || '').split('/');

    if ((arrayed?.length ?? 0) < 3) {
      activePage.value = 'Home';
      return;
    }

    const slug = (arrayed).filter(Boolean).pop();
    activePage.value = (slug ?? '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  },
  { immediate: true },
);

const menuItems = computed<NavigationMenuItem[]>(() => [
  {
    label: $t('Home'),
    active: route.fullPath.endsWith(`/${locale.value}`),
    icon: 'material-symbols:home-outline-rounded',
    to: localePath('/'),
  },
  {
    label: $t('Projects'),
    active: route.fullPath.includes('/projects'),
    icon: 'material-symbols:rocket-launch-outline-rounded',
    to: localePath('/projects'),
  },
  {
    label: $t('TechStacks'),
    active: route.fullPath.endsWith('/tech-stacks'),
    icon: 'material-symbols:layers-outline-rounded',
    to: localePath('/tech-stacks'),
  },
]);
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.2s ease;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
