<template>
  <div>
    <AppLoadingIndicator :is-loading="status === 'pending'" />

    <AppError
      :has-error="status === 'error' || Boolean(error)"
      :error="error"
      :status="status"
      @try-again="refresh" />

    <div
      v-if="about"
      class="pt-4 sm:pt-8">
      <div class="max-sm:px-4 max-md:px-8 grid grid-cols-1 md:grid-flow-row md:grid-cols-6 max-md:gap-y-4 md:gap-2 md:px-12">
        <div class="md:col-span-3">
          <Comark
            v-if="about.data?.aboutMe?.trim()"
            :markdown="about.data.aboutMe"
            class="md:pr-12 prose text-lg text-pretty dark:prose-invert whitespace-pre-line text-accented [&_a:after]:content-['_↗']" />
          <div
            v-if="about"
            class="mt-6 flex max-sm:justify-center gap-x-8">
            <UChip
              v-for="item in about.data.socialMedia"
              :key="item.id"
              :text="item.type ? TEXTS[item.type] : ''"
              :show="Boolean(item.type)"
              size="xl"
              position="bottom-right"
              :ui="{ base: 'text-[9px] p-1 bg-transparent text-muted' }">
              <UButton
                variant="link"
                color="neutral"
                size="xl"
                :icon="item.icon"
                :to="item.url"
                :aria-label="item.platform"
                rel="noopener noreferrer"
                target="_blank"
                :ui="{ base: 'p-1', leadingIcon: 'size-5 md:size-6' }" />
            </UChip>
          </div>
        </div>

        <div class="relative max-md:order-first md:col-span-3">
          <CloudinaryImage
            v-if="about.data.heroImage?.publicId"
            class="rounded-xl w-full select-none object-cover object-center"
            :public-id="about.data.heroImage.publicId"
            :alt="about.data.heroImage.alt ?? TEXTS.Image"
            :width="about.data.heroImage.width"
            :height="about.data.heroImage.height" />

          <div class="absolute top-4 right-4 md:col-start-5 md:col-span-1">
            <p class="px-3 py-1.5 font-mono bottom-2 right-2 text-[var(--ui-color-neutral-800)] text-lg sm:text-xl rounded-lg bg-white/40 backdrop-blur-lg">
              {{ TEXTS.metaTitle }}
            </p>
            <CloudinaryImage
              v-if="about.data.meImage?.publicId"
              :public-id="about.data.meImage.publicId"
              :alt="about.data.meImage.alt ?? TEXTS.Image"
              :width="about.data.meImage.width"
              :height="about.data.meImage.height"
              class="size-20 lg:size-24 z-1 -translate-x-4 -translate-y-2 ml-auto rounded-full border border-white/50 shadow-sm select-none" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AboutMeResponse } from '~~/schema-types/shared';

const { locale } = useI18n();
const { TEXTS } = useNonReactiveTranslation();
const route = useRoute();

const {
  status,
  data: about,
  refresh,
  error,
} = useFetch<AboutMeResponse>(
  '/api/about-me',
  {
    method: 'GET',
    key: route.path,
    query: {
      locale: locale.value,
    },
  },
);

useSeoMeta({
  title: () => `duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  description: () => TEXTS.metaDescription,
  ogSiteName: () => `duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  ogTitle: () => `duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  ogDescription: () => TEXTS.metaDescription,
  ogImage: () => ({
    url: 'https://duetocodes.com/og_banner.png',
    alt: TEXTS.Image,
    width: 1200,
    height: 630,
    type: 'image/png',
  }),
  ogType: 'website',
  twitterTitle: () => `duetocodes | ${TEXTS.FrontendDeveloper} (Vue & Nuxt)`,
  twitterDescription: () => TEXTS.metaDescription,
  twitterCard: 'summary_large_image',
  twitterImage: () => ({
    url: 'https://duetocodes.com/og_banner.png',
    alt: TEXTS.Image,
    width: 1200,
    height: 630,
    type: 'image/png',
  }),
});
</script>
