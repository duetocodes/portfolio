<template>
  <div>
    <AppLoadingIndicator :is-loading="status === 'pending'" />

    <AppError
      :has-error="status === 'error'"
      :error="error"
      :status="status"
      @try-again="refresh" />

    <div
      v-if="about"
      class="pt-10">
      <div class="max-sm:px-4 max-md:px-8 grid grid-cols-1 md:grid-flow-row md:grid-cols-6 max-md:gap-y-8 md:gap-2 md:px-12">
        <div class="md:col-span-3">
          <MDC
            v-if="about.data?.aboutMe"
            :value="about.data.aboutMe"
            class="md:pr-12 prose text-lg text-pretty dark:prose-invert whitespace-pre-line text-accented [&_a:after]:content-['_↗']" />
        </div>

        <div class="relative max-md:order-first md:col-span-3">
          <NuxtImg
            :src="about.data.hero_light.image.url"
            :alt="about.data.hero_light.image.alternativeText ?? $t('Image')"
            class="rounded-xl w-full select-none"
            width="640"
            fit="contain" />

          <div class="absolute top-4 right-4 md:col-start-5 md:col-span-1">
            <p class="px-3 py-1.5 font-mono bottom-2 right-2 text-[var(--ui-color-neutral-800)] text-lg sm:text-xl rounded-lg bg-white/40 backdrop-blur-lg">
              {{ $t('meta.title') }}
            </p>
            <NuxtImg
              :src="about.data.avatar_light.image.url"
              :alt="about.data.avatar_light.image.alternativeText || $t('Image')"
              class="size-20 lg:size-24 z-1 -translate-x-4 -translate-y-2 ml-auto rounded-full border border-white/50 shadow-sm select-none"
              sizes="120px"
              fit="contain" />
          </div>

          <div
            v-if="about"
            class="mt-4 flex justify-end gap-x-4">
            <UChip
              v-for="(item, index) in about.data.socialMedia"
              :key="index"
              :text="$t('work')"
              :show="item.type === 'work'"
              size="xl"
              color="neutral"
              position="bottom-right"
              :ui="{ base: 'text-[9px] p-1' }">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AboutMeResponse } from '@/types';

const { t: $t, locale } = useI18n();
const route = useRoute();
const nuxtApp = useNuxtApp();

const {
  status,
  refresh,
  data: about,
  error,
} = useFetch<{ data: AboutMeResponse }>(
  '/api/about-me',
  {
    method: 'GET',
    key: route.fullPath,
    query: {
      locale: locale.value,
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
    href: `https://duetocodes.com${route.fullPath}`,
  }],
});

useSeoMeta({
  title: 'duetocodes',
  description: () => $t('meta.description'),
  ogSiteName: () => `Freddie — ${$t('meta.title')}`,
  ogTitle: () => `Freddie — ${$t('meta.title')}`,
  ogDescription: () => $t('meta.description'),
  ogImage: () => ({
    url: about.value?.data?.og_banner?.image?.url,
    alt: about.value?.data?.og_banner?.image?.alternativeText,
    width: about.value?.data?.og_banner?.image?.width,
    height: about.value?.data?.og_banner?.image?.height,
    type: about.value?.data?.og_banner?.image?.mime,
  }),
  ogUrl: `https://duetocodes.com${route.fullPath}`,
  ogType: 'website',
  twitterTitle: () => `Freddie — ${$t('meta.title')}`,
  twitterDescription: () => $t('meta.description'),
  twitterCard: 'summary_large_image',
  twitterImage: () => ({
    url: about.value?.data?.og_banner?.image?.url,
    alt: about.value?.data?.og_banner?.image?.alternativeText,
    width: about.value?.data?.og_banner?.image?.width,
    height: about.value?.data?.og_banner?.image?.height,
    type: about.value?.data?.og_banner?.image?.mime,
  }),
});
</script>
