<template>
  <div>
    <component
      :is="activeSlug"
      v-if="activeSlug" />

    <div
      v-else
      class="mt-44 w-full flex justify-center items-center">
      <UAlert
        :title="$t('ItemCurrentlyNotAvailable', { item: `${route.params.slugId}` })"
        icon="material-symbols:settings-alert-outline"
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

const activeSlug = ref(null);
const nuxtApp = useNuxtApp();
const localePath = useLocalePath();
const route = useRoute();
const { t: $t, locale } = useI18n();

const { data: slugs } = await useFetch<{ data: ProjectSlug[] }>(
  `/api/projects`,
  {
    method: 'GET',
    key: 'projects-published-slugs-all-locales',
    query: {
      locale: '*',
      fields: ['slugId', 'locale'],
    },
    getCachedData(key) {
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      return data;
    },
  },
);

const isPublishedInCurrentLocale = slugs.value?.data.find((item) => {
  return item.slugId === route.params.slugId && item.locale === locale.value;
});

if (isPublishedInCurrentLocale) {
  activeSlug.value = defineAsyncComponent(() => import(`~/components/Projects/${isPublishedInCurrentLocale.slugId}.vue`));
}
else {
  const isPublishedInAtLeastOneLocale = slugs.value?.data.find((item) => {
    return item.slugId === route.params.slugId;
  });

  if (!isPublishedInAtLeastOneLocale) {
    // unknown slug
    throw createError({
      statusCode: 404,
      statusMessage: $t('error.404'),
    });
  }
}
</script>
