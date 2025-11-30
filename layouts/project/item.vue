<template>
  <div
    class="relative
      mx-auto px-4 sm:px-6 pb-96 sm:pb-48 md:pb-16
      max-w-5xl w-full min-w-0 min-h-[100svh]
      overflow-auto">
    <UBreadcrumb
      class="mt-8"
      separator-icon="material-symbols:chevron-right"
      :items="crumbItems"
      :ui="{ link: 'text-lg' }" />

    <slot />
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui';

const route = useRoute();
const localePath = useLocalePath();
const { t: $t } = useI18n();

const crumbItems = computed<BreadcrumbItem[]>(() => {
  const CRUMB_1 = {
    to: localePath('/projects'),
    label: $t('Projects'),
  };
  const tyv = {
    to: localePath('/projects/treasury-yield-visualiser'),
    label: $t('TreasuryYieldVisualiser'),
  };
  const cc = {
    to: localePath('/projects/currency-converter'),
    label: $t('CurrencyConverter'),
  };
  const tg = {
    to: localePath('/projects/typing-game'),
    label: $t('TypingGame'),
  };

  const path = route.path;
  let crumb2 = { to: '', label: '' };

  if (path.endsWith('/projects/treasury-yield-visualiser')) {
    crumb2 = tyv;
  }
  else if (path.endsWith('/projects/currency-converter')) {
    crumb2 = cc;
  }
  else if (path.endsWith('/projects/typing-game')) {
    crumb2 = tg;
  }
  return [
    CRUMB_1,
    crumb2,
  ];
});
</script>
