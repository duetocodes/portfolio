<template>
  <div>
    <AppLoadingIndicator :is-loading="status === 'pending' && !error" />

    <AppError
      :has-error="status === 'error' || Boolean(error)"
      :error="error"
      :status="status"
      :button-label="TEXTS.BackToHome"
      @try-again="navigateHome" />

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
            <CloudinaryImage
              :public-id="item.icon_default?.publicId"
              :alt="item.icon_default?.alt"
              :width="item.icon_default?.width"
              :height="item.icon_default?.height"
              :class="{ 'dark:hidden': item.icon_dark }"
              class="mr-2 h-8 w-auto max-w-[100px] object-contain select-none" />
            <CloudinaryImage
              v-if="item.icon_dark"
              :public-id="item.icon_dark?.publicId ?? item.icon_default?.publicId"
              :alt="item.icon_dark?.alt ?? item.icon_default?.alt"
              :width="item.icon_dark?.width ?? item.icon_default?.width"
              :height="item.icon_dark?.height ?? item.icon_default?.height"
              loading="eager"
              class="hidden dark:block mr-2 h-8 w-auto max-w-[100px] object-contain select-none" />
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
          <Comark
            v-if="item.description?.trim()"
            :markdown="stripMarkdownLinks(item.description)"
            class="line-clamp-2 sm:line-clamp-5 text-md text-muted text-pretty whitespace-pre-line prose dark:prose-invert" />
        </UCard>
      </ULink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TechStackApiResponse } from '~~/schema-types/shared';

const { locale } = useI18n();
const { TEXTS } = useNonReactiveTranslation();
const route = useRoute();
const localePath = useLocalePath();

useSeoMeta({
  title: () => `${TEXTS.TechStacks} - duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  description: () => TEXTS.TechStackHelpText,
  ogSiteName: () => `${TEXTS.TechStacks} - duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  ogTitle: () => `${TEXTS.TechStacks} - duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  ogDescription: () => TEXTS.TechStackHelpText,
  ogImage: '/og_banner.png',
  ogType: 'website',
  twitterTitle: () => `${TEXTS.TechStacks} - duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  twitterDescription: () => TEXTS.TechStackHelpText,
  twitterCard: 'summary_large_image',
  twitterImage: '/og_banner.png',
});

const {
  status,
  data: stacks,
  error,
} = useFetch<TechStackApiResponse>(
  `/api/tech-stacks`,
  {
    method: 'GET',
    key: route.path,
    query: {
      locale: locale.value,
    },
  },
);

const navigateHome = () => {
  void navigateTo(localePath('/'));
};
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
