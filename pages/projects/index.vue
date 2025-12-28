<template>
  <div>
    <AppLoadingIndicator :is-loading="status === 'pending' && !error" />

    <AppError
      :has-error="status === 'error' || Boolean(error)"
      :error="error"
      :status="status"
      @try-again="refresh" />

    <div
      v-if="projects?.data"
      class="pt-4 sm:pt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <ULink
        v-for="item in projects.data"
        :key="item.id"
        :to="localePath(`/projects/${item.slugId}`)"
        :ui="{ base: 'h-full' }"
        rel="noopener noreferrer">
        <UCard
          as="section"
          :ui="{
            root: 'group h-full transition hover:shadow-md hover:bg-elevated/50',
            body: 'space-y-2',
          }">
          <UButton
            as="div"
            class="p-0 text-md"
            variant="link">
            <h4 class="projectName text-md line-clamp-2 text-default text-left break-ellipsis group-hover:text-primary">
              {{ item.title }}
            </h4>
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
              size="sm"
              class="text-dimmed"
              variant="outline"
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
import type { z } from 'zod';
import type { ProjectSchema } from '~/schemas';

type Project = z.infer<typeof ProjectSchema>;

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
    key: route.path,
    query: {
      'locale': locale.value,
      'sort[0]': 'sortIndex:asc',
      'fields': ['title', 'description', 'tag', 'sortIndex', 'slugId'],
    },
    getCachedData(key) {
      const data = nuxtApp.payload.data?.[key] ?? nuxtApp.static.data?.[key];
      return data;
    },
  },
);

useHead({
  link: [{
    rel: 'canonical',
    href: `https://duetocodes.com${route.path}`, // equals <loc>
  }],
});

useSeoMeta({
  title: () => `${$t('Projects')} - duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
  description: () => $t('SelfDevelopedApplications', projects.value?.data?.length ?? 3),
  ogSiteName: () => `${$t('Projects')} - duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
  ogTitle: () => `${$t('Projects')} - duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
  ogDescription: () => $t('SelfDevelopedApplications', projects.value?.data?.length ?? 3),
  ogImage: '/og_banner.png',
  ogUrl: `https://duetocodes.com${route.path}`,
  ogType: 'website',
  twitterTitle: () => `${$t('Projects')} - duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
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
