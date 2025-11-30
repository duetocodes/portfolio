<template>
  <UApp>
    <header class="h-[var(--app-header-height)] grid px-4 sm:px-6 sticky z-50 w-full top-0 shadow backdrop-blur-lg">
      <div class="mx-auto w-full flex justify-between max-w-5xl">
        <p
          v-if="activePage?.mobileHeading"
          class="sm:hidden flex items-center font-semibold text-md text-muted">
          {{ activePage.mobileHeading }}
        </p>

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

    <main role="main">
      <h1 class="sr-only">
        {{ activePage.h1 || '' }}
      </h1>
      <h2
        v-if="activePage?.h2"
        class="sr-only">
        {{ activePage.h2 || '' }}
      </h2>

      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>

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
              'gap-0.5 flex flex-col text-center text-sm transition-colors font-semibold',
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
import type { z } from 'zod';
import type { NavigationMenuItem } from '@nuxt/ui';
import type { TechStackResponseSchema } from '~/schemas';

type TechStackResponse = z.infer<typeof TechStackResponseSchema>;

const route = useRoute();
const nuxtApp = useNuxtApp();
const localePath = useLocalePath();

const {
  t: $t,
  locale,
  locales,
} = useI18n();

const lang = computed(() => locale.value);

const dir = computed(() => {
  const selected = locales.value.find(lang => lang.code === locale.value);
  return selected?.dir;
});

const {
  data: stacks,
} = await useFetch<string[]>(
  `/api/tech-stacks`,
  {
    method: 'GET',
    key: `root-app-stacks`,
    query: {
      locale: 'en',
    },
    onResponse({ response }) {
      const payload = ((response._data as { data?: TechStackResponse[] } | undefined)?.data) ?? [];
      response._data = payload.map((item: TechStackResponse) => item.name);
    },
    getCachedData(key) {
      const data = nuxtApp.payload.data?.[key] ?? nuxtApp.static.data?.[key];
      return data;
    },
  },
);

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
  link: [
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
  script: [
    {
      // https://schema.org/Person
      // https://search.google.com/test/rich-results
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': 'Freddie',
        'email': 'duetocodes@outlook.com',
        'url': 'https://duetocodes.com',
        'jobTitle': $t('FrontendDeveloper'),
        'description': $t('meta.description'),
        'knowsAbout': stacks.value ?? [],
        'sameAs': [
          'https://github.com/duetocodes',
        ],
      }),
    },
  ],
});

const activePage = computed(() => {
  const path = route.path;

  switch (true) {
    case path === localePath('/'):
      return {
        mobileHeading: $t('Home'),
        h1: `duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
        h2: $t('meta.description'),
      };

    case path.endsWith(localePath('/projects')):
      return {
        mobileHeading: $t('Projects'),
        h1: $t('Projects'),
        h2: $t('SelfDevelopedApplications', 3),
      };
    case path.endsWith(localePath('/projects/treasury-yield-visualiser')):
      return {
        mobileHeading: $t('Projects'),
        h1: `${$t('TreasuryYieldVisualiser')} - ${$t('Projects')} | duetocodes`,
        h2: `${$t('Projects')}`,
      };
    case path.endsWith(localePath('/projects/currency-converter')):
      return {
        mobileHeading: $t('Projects'),
        h1: `${$t('CurrencyConverter')} - ${$t('Projects')} | duetocodes`,
        h2: `${$t('Projects')}`,
      };
    case path.endsWith(localePath('/projects/typing-game')):
      return {
        mobileHeading: $t('Projects'),
        h1: `${$t('TypingGame')} - ${$t('Projects')} | duetocodes`,
        h2: `${$t('Projects')}`,
      };

    case path.endsWith(localePath('/tech-stacks')):
      return {
        mobileHeading: $t('TechStacks'),
        h1: $t('TechStacks'),
        h2: $t('TechStackHelpText'),
      };
    default:
      return {};
  }
});

const menuItems = computed<NavigationMenuItem[]>(() => [
  {
    label: $t('Home'),
    active: route.path === localePath('/'),
    icon: 'material-symbols:home-outline-rounded',
    to: localePath('/'),
  },
  {
    label: $t('Projects'),
    active: route.path.startsWith(localePath('/projects')),
    icon: 'material-symbols:rocket-launch-outline-rounded',
    to: localePath('/projects'),
  },
  {
    label: $t('TechStacks'),
    active: route.path.startsWith(localePath('/tech-stacks')),
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
