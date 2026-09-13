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
            variant="link"
            :leading-icon="PROJECT_SLUG_ENUM[item.slugId]?.icon || 'material-symbols:widgets-outline'"
            :ui="{
              leadingIcon: [PROJECT_SLUG_ENUM[item.slugId]?.iconColor || 'text-default', 'group-hover:text-primary'],
            }">
            <h4 class="projectName text-md line-clamp-2 text-default text-left break-ellipsis group-hover:text-primary">
              {{ item.title }}
            </h4>
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

          <Comark
            v-if="item.description?.trim()"
            :markdown="stripMarkdownLinks(item.description)"
            class="line-clamp-2 sm:line-clamp-5 text-pretty whitespace-pre-line prose dark:prose-invert text-muted" />
        </UCard>
      </ULink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Projects } from '~~/schema-types/shared';

const { t: $t, locale } = useI18n();
const { TEXTS } = useNonReactiveTranslation();
const { PROJECT_SLUG_ENUM } = useFrontend();
const route = useRoute();
const localePath = useLocalePath();

const {
  status,
  refresh,
  data: projects,
  error,
} = useFetch<Projects>(
  `/api/projects`,
  {
    method: 'GET',
    key: route.path,
    query: {
      locale: locale.value,
    },
  },
);

useSeoMeta({
  title: () => `${TEXTS.Projects} - duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  description: () => $t('SelfDevelopedApplications', projects.value?.data?.length ?? 3),
  ogSiteName: () => `${TEXTS.Projects} - duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  ogTitle: () => `${TEXTS.Projects} - duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  ogDescription: () => $t('SelfDevelopedApplications', projects.value?.data?.length ?? 3),
  ogImage: () => ({
    url: 'https://duetocodes.com/og_banner.png',
    alt: TEXTS.Image,
    width: 1200,
    height: 630,
    type: 'image/png',
  }),
  ogType: 'website',
  twitterTitle: () => `${TEXTS.Projects} - duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  twitterCard: 'summary_large_image',
  twitterDescription: () => $t('SelfDevelopedApplications', projects.value?.data?.length ?? 3),
  twitterImage: () => ({
    url: 'https://duetocodes.com/og_banner.png',
    alt: TEXTS.Image,
    width: 1200,
    height: 630,
    type: 'image/png',
  }),
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
