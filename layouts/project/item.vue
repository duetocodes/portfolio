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
import type { ProjectItemPageMeta } from '~/types';

const route = useRoute();
const pageMeta = route.meta as ProjectItemPageMeta;
const localePath = useLocalePath();
const { t: $t } = useI18n();

const crumbItems = computed<BreadcrumbItem[]>(() => {
  return [
    {
      to: localePath('/projects'),
      label: $t('Projects'),
    },
    {
      to: localePath(`/projects/${pageMeta.slugId}`),
      label: $t(pageMeta.slugLabel),
    },
  ];
});
</script>
