<template>
  <div>
    <AppLoadingIndicator :is-loading="status === 'pending' && !error" />

    <AppError
      :has-error="status === 'error' || Boolean(error)"
      :error="error"
      :status="status"
      @try-again="refresh" />

    <UFormField
      class="pt-8"
      :label="$t('Projects')"
      :description="$t('SelfDevelopedApplications', projects?.data?.length ?? 1)"
      :ui="{ label: 'max-sm:hidden text-lg', description: 'prose text-md' }" />

    <div
      v-if="projects?.data"
      class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
      <ULink
        v-for="item in projects.data"
        :key="item.id"
        :to="localePath(`/projects/${item.identifier}`)"
        :ui="{ base: 'h-full' }"
        rel="noopener noreferrer">
        <UCard
          as="article"
          :ui="{
            root: 'group h-full transition hover:shadow-md hover:bg-elevated/50',
            body: 'space-y-2',
          }">
          <UButton
            as="div"
            class="p-0 text-md"
            variant="link">
            <span class="projectName text-md line-clamp-2 text-default text-left break-ellipsis group-hover:text-primary">
              {{ item.title }}
            </span>
            <template #trailing>
              <UIcon
                name="material-symbols:link-rounded"
                class="align-middle rotate-135 size-4 shrink-0 text-muted transition group-hover:text-primary group-hover:rotate-315" />
            </template>
          </UButton>
          <div>
            <UBadge
              v-if="item.tag"
              :key="item.id"
              class="truncate font-light ml-auto"
              variant="soft"
              color="neutral"
              :label="item.tag" />
          </div>

          <MDC
            v-if="item.description"
            :value="stripMarkdownLinks(item.description)"
            class="line-clamp-5 text-pretty whitespace-pre-line prose dark:prose-invert text-muted"
            tag="article" />
        </UCard>
      </ULink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types';

const { t: $t, locale } = useI18n();
const route = useRoute();
const nuxtApp = useNuxtApp();
const localePath = useLocalePath();

const {
  status,
  refresh,
  data: projects,
  error,
} = useFetch<{ data: Project[] | null }>(
  `/api/projects`,
  {
    method: 'GET',
    key: route.fullPath,
    query: {
      'locale': locale.value,
      'sort[0]': 'sortIndex:asc',
      'fields': ['title', 'description', 'tag', 'sortIndex', 'identifier'],
    },
    getCachedData(key) {
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      return data;
    },
  },
);

useHead({
  link: [{
    rel: 'canonical',
    href: `https://duetocodes.com${route.fullPath}`, // equals <loc>
  }],
});

useSeoMeta({
  title: () => $t('Projects'),
  description: () => $t('SelfDevelopedApplications', projects.value?.data?.length ?? 3),
  ogSiteName: () => `Freddie — ${$t('meta.title')}`,
  ogTitle: () => $t('Projects'),
  ogDescription: () => $t('SelfDevelopedApplications', projects.value?.data?.length ?? 3),
  ogImage: '/og_banner.png',
  ogUrl: `https://duetocodes.com${route.fullPath}`,
  ogType: 'website',
  twitterTitle: () => $t('Projects'),
  twitterCard: 'summary_large_image',
  twitterDescription: () => $t('SelfDevelopedApplications', projects.value?.data?.length ?? 3),
  twitterImage: '/og_banner.png',
});
</script>

<style scoped>
@media (pointer:coarse) {
  .group:hover {
    background-color: color-mix(in oklch, var(--ui-bg-elevated) 50%, transparent);
    box-shadow: var(--shadow-lg);
  }

  .group:hover .iconify {
    color: var(--ui-primary);
    transform: rotate(360deg);
  }

  .group:hover .projectName {
    color: var(--ui-primary);
  }
}
</style>
