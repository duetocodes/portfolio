<template>
  <div>
    <component
      :is="assignedComponent"
      v-if="assignedComponent" />

    <div
      v-else-if="isPublishedInAtLeastOneLocale"
      class="mt-44 w-full flex justify-center items-center">
      <UAlert
        :title="$t('ItemCurrentlyNotAvailable', { item: slugLabel })"
        icon="material-symbols:construction"
        class="max-w-sm md:max-w-md"
        color="warning"
        variant="subtle">
        <template #description>
          <div class="flex justify-end mt-8 gap-x-2">
            <UButton
              :label="$t('GoBack')"
              :aria-label="$t('GoBack')"
              size="lg"
              color="warning"
              variant="ghost"
              icon="material-symbols:u-turn-right-rounded"
              @click="navigateTo(localePath('/projects'))" />
          </div>
        </template>
      </UAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { z } from 'zod';
import type { ProjectSchema } from '~/schemas';

type Project = z.infer<typeof ProjectSchema>;
type ProjectSlug = Pick<Project, 'id' | 'documentId' | 'slugId' | 'locale'>;

const assignedComponent = ref(null);
const nuxtApp = useNuxtApp();
const localePath = useLocalePath();
const route = useRoute();
const { t: $t, locale } = useI18n();

const { data: cached } = useNuxtData<{ data: ProjectSlug[] }>('projects-published-slugs-all-locales');

const isPublishedInAtLeastOneLocale = ref<ProjectSlug>();

// onBeforeMount(() => {
//   isPublishedInAtLeastOneLocale.value = cached.value?.data.find((item) => {
//     return item.slugId === route.params.slugId;
//   });

//   if (!cached.value) {
//     throw createError({
//       statusCode: 500,
//       statusMessage: $t('UnexpectedErrorOccurred'),
//     });
//   }

//   if (!isPublishedInAtLeastOneLocale.value) {
//     // unknown slug
//     throw createError({
//       statusCode: 404,
//       statusMessage: $t('error.404') + `: /${route.params.slugId}`,
//     });
//   }
// });

if (import.meta.client) {
  isPublishedInAtLeastOneLocale.value = cached.value?.data.find((item) => {
    return item.slugId === route.params.slugId;
  });

  if (!cached.value) {
    throw createError({
      statusCode: 500,
      statusMessage: $t('UnexpectedErrorOccurred'),
    });
  }

  if (!isPublishedInAtLeastOneLocale.value) {
    // unknown slug
    throw createError({
      statusCode: 404,
      statusMessage: $t('error.404') + `: /${route.params.slugId}`,
    });
  }
}

const slugLabel = computed(() => {
  switch (route.params.slugId) {
    case 'treasury-yield-visualiser':
      return $t('TreasuryYieldVisualiser');
    case 'currency-converter':
      return $t('CurrencyConverter');
    case 'typing-game':
      return $t('TypingGame');
    default:
      return route.params.slugId;
  }
});

const { data: renderedSlugs } = await useFetch<{ data: ProjectSlug[] }>(
  `/api/projects`,
  {
    method: 'GET',
    key: 'projects-published-slugs-all-locales',
    query: {
      locale: '*',
      fields: ['slugId', 'locale'],
    },
    server: true,
    getCachedData(key) {
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      return data;
    },
  },
);

const isPublishedInCurrentLocale = renderedSlugs.value?.data.find((item) => {
  return item.slugId === route.params.slugId && item.locale === locale.value;
});

if (isPublishedInCurrentLocale) {
  assignedComponent.value = defineAsyncComponent(() => import(`~/components/Projects/${isPublishedInCurrentLocale.slugId}.vue`));
}
</script>
