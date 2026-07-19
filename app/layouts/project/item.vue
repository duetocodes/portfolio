<template>
  <div
    class="relative
      mx-auto px-4 sm:px-6 pb-96 sm:pb-48 md:pb-16
      max-w-5xl w-full min-w-0 min-h-[100svh]
      overflow-auto">
    <div class="flex pt-4 sm:pt-8 gap-x-6">
      <UBreadcrumb
        class=""
        separator-icon="material-symbols:chevron-right"
        :items="crumbItems"
        :ui="{ link: 'text-lg' }" />
      <div class="hidden md:flex md:items-center">
        <UButton
          variant="link"
          color="neutral"
          size="xl"
          icon="simple-icons:github"
          :to="BASE_FILE_URL + `${pageMeta.slugId ? `/${pageMeta.slugId}.vue` : ''}`"
          aria-label="github"
          rel="noopener noreferrer"
          target="_blank"
          :ui="{ base: 'p-0', leadingIcon: 'size-5 md:size-5' }" />
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui';
import type { ProjectItemPageMeta } from '~~/schema-types/shared';

const BASE_FILE_URL = 'https://github.com/duetocodes/portfolio/blob/main/app/pages/projects';
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
