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
type ProjectSlug = Pick<Project, 'id' | 'documentId' | 'slugId'>;

const activeSlug = ref(null);
const nuxtApp = useNuxtApp();
const localePath = useLocalePath();
const route = useRoute();

const { data: slugs } = await useFetch<{ data: ProjectSlug[] }>(
  `/api/projects`,
  {
    method: 'GET',
    key: 'project-slugs',
    query: {
      locale: 'en', // fixed in this context
      fields: ['slugId'],
    },
    getCachedData(key) {
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      return data;
    },
  },
);

const isPublished = slugs.value?.data.find(item => item.slugId === route.params.slugId);

if (isPublished) {
  activeSlug.value = defineAsyncComponent(() => import(`~/components/Projects/${isPublished.slugId}.vue`));
}
</script>
