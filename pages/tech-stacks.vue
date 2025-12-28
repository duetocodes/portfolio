<template>
  <div>
    <AppLoadingIndicator :is-loading="status === 'pending' && !error" />

    <AppError
      :has-error="status === 'error' || Boolean(error)"
      :error="error"
      :status="status"
      @try-again="refresh" />

    <div
      v-if="stacks?.data"
      class="pt-4 sm:pt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <ULink
        v-for="item in stacks?.data"
        :key="item.id"
        :to="item.website"
        :ui="{ base: 'h-full' }"
        target="_blank"
        rel="noopener noreferrer">
        <UCard
          as="article"
          :ui="{
            root: 'group h-full transition hover:shadow-lg hover:bg-elevated/50',
            body: 'space-y-2',
          }">
          <UButton
            as="div"
            class="p-0 text-md"
            variant="link">
            <img
              class="dark:hidden mr-2 h-8 max-w-[100px] object-contain select-none"
              :src="item.icon_default?.url"
              :alt="item.icon_default.alternativeText || item.name" />
            <img
              class="hidden dark:block mr-2 h-8 max-w-[100px] object-contain select-none"
              :src="item.icon_dark?.url ?? item.icon_default?.url"
              :alt="item.icon_default.alternativeText || item.name" />
            <h4 class="stackName transition text-default group-hover:text-primary line-clamp-2">
              {{ item.name }}
            </h4>
            <template #trailing>
              <UIcon
                name="material-symbols:arrow-outward-rounded"
                class="self-center text-muted transition group-hover:text-primary group-hover:-translate-y-1 group-hover:translate-x-1" />
            </template>
          </UButton>
          <div
            v-if="item?.tech_stack_tags?.length"
            class="flex gap-2 flex-wrap">
            <UBadge
              v-for="tag in item.tech_stack_tags"
              :key="tag.id"
              size="sm"
              class="text-dimmed"
              variant="outline"
              color="neutral"
              :label="tag.tag" />
          </div>
          <MDC
            :value="stripMarkdownLinks(item.description)"
            class="line-clamp-5 text-md text-muted text-pretty whitespace-pre-line prose dark:prose-invert"
            tag="article" />
        </UCard>
      </ULink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { z } from 'zod';
import type { TechStackResponseSchema } from '~/schemas';

type TechStackResponse = z.infer<typeof TechStackResponseSchema>;

const { t: $t, locale } = useI18n();
const route = useRoute();
const nuxtApp = useNuxtApp();

useHead({
  link: [{
    rel: 'canonical',
    href: `https://duetocodes.com${route.path}`,
  }],
});

useSeoMeta({
  title: () => `${$t('TechStacks')} - duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
  description: () => $t('TechStackHelpText'),
  ogSiteName: () => `${$t('TechStacks')} - duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
  ogTitle: () => `${$t('TechStacks')} - duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
  ogDescription: () => $t('TechStackHelpText'),
  ogImage: '/og_banner.png',
  ogUrl: `https://duetocodes.com${route.path}`,
  ogType: 'website',
  twitterTitle: () => `${$t('TechStacks')} - duetocodes | ${$t('FrontendDeveloper')} (Vue & Nuxt)`,
  twitterDescription: () => $t('TechStackHelpText'),
  twitterCard: 'summary_large_image',
  twitterImage: '/og_banner.png',
});

const {
  status,
  refresh,
  data: stacks,
  error,
} = useFetch<{ data: TechStackResponse[] }>(
  `/api/tech-stacks`,
  {
    method: 'GET',
    key: route.path,
    query: {
      locale: locale.value,
    },
    getCachedData(key) {
      const data = nuxtApp.payload.data?.[key] ?? nuxtApp.static.data?.[key];
      return data;
    },
  },
);
</script>

<style scoped>
@media (pointer:coarse) {
  .group:hover {
    background-color: color-mix(in oklch, var(--ui-bg-elevated) 50%, transparent);
    box-shadow: var(--shadow-lg);
  }

  .group:hover .iconify {
    color: var(--ui-primary);
    transform: translateX(4px) translateY(-4px);
  }

  .group:hover .stackName {
    color: var(--ui-primary);
  }
}
</style>
