<template>
  <div>
    <UCard
      variant="subtle"
      :ui="{
        root: 'max-w-sm mx-auto mt-16',
        header: 'flex items-center justify-between',
        body: 'space-y-4',
      }">
      <template #header>
        <span class="font-semibold">
          {{ $t('Viewport') }}
        </span>
        <UIcon
          :name="deviceIcon.icon"
          class="size-8 text-muted"
          :class="[deviceIcon.class]" />
      </template>

      <UFormField
        :label="$t('Display')"
        :ui="{
          label: 'text-base',
          container: 'text-base text-muted space-y-1',
        }">
        <div class="pl-2 grid grid-cols-12">
          <span class="col-span-4">
            {{ $t('Dimension') }}
          </span>
          <span class="col-span-1">
            :
          </span>
          <span class="col-span-7">
            {{ device.screen.width }} W × {{ device.screen.height }} H
          </span>
        </div>

        <div class="pl-2 grid grid-cols-12">
          <span class="col-span-4">
            {{ $t('Orientation') }}
          </span>
          <span class="col-span-1">
            :
          </span>
          <span class="col-span-7">
            {{ device.orientation.type }}
          </span>
        </div>

        <div class="pl-2 grid grid-cols-12">
          <span class="col-span-4">
            {{ $t('Colour') }}
          </span>
          <span class="col-span-1">
            :
          </span>
          <span class="col-span-7">
            {{ device.screen.colorDepth }} bit
          </span>
        </div>

        <div class="pl-2 grid grid-cols-12">
          <section class="flex gap-x-4 items-center col-span-4">
            <span>
              DPR
            </span>
            <UTooltip
              v-model:open="isTooltip"
              :delay-duration="0"
              :ui="{
                content: 'p-4 flex-col items-start h-auto',
              }">
              <template #content>
                Device Pixel Ratio
                <ul class="relative text-base p-2 ml-2 list-disc space-y-2">
                  <li>{{ $t('Tip1DPR') }}</li>
                  <li>{{ $t('Tip2DPR') }}</li>
                  <li>{{ $t('Tip3DPR') }}</li>
                </ul>
              </template>
              <UButton
                v-if="device.form === 'Phone'"
                class="text-muted"
                icon="material-symbols:info-outline-rounded"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="isTooltip = true" />
              <UIcon
                v-else
                name="material-symbols:info-outline-rounded"
                class="shrink-0 text-muted" />
            </UTooltip>
          </section>
          <span class="col-span-1">
            :
          </span>
          <span class="col-span-7">
            {{ device.screen.devicePixelRatio }}
          </span>
        </div>
      </UFormField>

      <UFormField
        :label="$t('Page')"
        :ui="{
          label: 'text-base',
          container: 'text-base text-muted',
        }">
        <div class="pl-2 grid items-center grid-cols-12">
          <span class="col-span-4">
            {{ $t('Layout') }}
          </span>
          <span class="col-span-1">
            :
          </span>
          <span class="col-span-7">
            {{ device.clientWidth }} W × {{ device.clientHeight }} H
          </span>
        </div>
      </UFormField>

      <UFormField
        v-if="device.ua.success"
        :label="$t('System')"
        :ui="{
          label: 'text-base',
          container: 'text-base text-muted',
        }">
        <div
          v-if="device.ua.platform"
          class="pl-2 grid items-center grid-cols-12">
          <span class="col-span-4">
            {{ $t('Platform') }}
          </span>
          <span class="col-span-1">
            :
          </span>
          <span class="col-span-7">
            {{ device.ua.platform }} {{ device.ua.platformVersion }}
          </span>
        </div>

        <div class="pl-2 grid grid-cols-12">
          <span class="col-span-4">
            {{ $t('Appearance') }}
          </span>
          <span class="col-span-1">
            :
          </span>
          <span class="col-span-7">
            {{ device.appearance ? $t('Dark') : $t('Light') }}
          </span>
        </div>

        <div class="pl-2 grid items-center grid-cols-12">
          <span class="col-span-4">
            {{ $t('FormFactor') }}
          </span>
          <span class="col-span-1">
            :
          </span>
          <span class="col-span-7">
            {{ $t(device.form || '--') }}
            <span class="italic text-sm"> ({{ $t('estimated') }})</span>
          </span>
        </div>
      </UFormField>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ProjectItemPageMeta } from '~/types';
import type { ProjectItemDataSchema } from '~/schemas';
import type { z } from 'zod';

const SLUG_ID = 'know-your-viewport';
const nuxtApp = useNuxtApp();
const route = useRoute();
const { t: $t, locale } = useI18n();
const device = useClientDevice();
const isTooltip = ref(false);

type ProjectItemDataObj = z.infer<typeof ProjectItemDataSchema>;

definePageMeta({
  layout: 'project-item',
  slugId: SLUG_ID,
  slugLabel: 'KnowYourViewport',
} satisfies ProjectItemPageMeta);

const {
  // non-crucial data
  data: overview,
} = useFetch<{ data: ProjectItemDataObj[] }>(
  '/api/projects',
  {
    method: 'GET',
    key: route.path,
    getCachedData(key) {
      const data = nuxtApp.payload.data?.[key] ?? nuxtApp.static.data?.[key];
      return data;
    },
    query: {
      'locale': locale.value,
      'filters[slugId][$eq]': SLUG_ID,
      'populate[preview][populate][image][fields]': ['url', 'alternativeText', 'width', 'height', 'mime'],
      'fields': 'description',
    },
  },
);

useHead({
  link: [{
    rel: 'canonical',
    href: `https://duetocodes.com${route.path}`,
  }],
});

useSeoMeta({
  title: () => `${$t('KnowYourViewport')} - ${$t('Projects')} | duetocodes`,
  description: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogSiteName: () => `${$t('KnowYourViewport')} - ${$t('Projects')} | duetocodes`,
  ogTitle: () => `${$t('KnowYourViewport')} - ${$t('Projects')} | duetocodes`,
  ogDescription: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogImage: () => ({
    url: overview.value?.data?.[0]?.preview?.image?.url,
    alt: overview.value?.data?.[0]?.preview?.image?.alternativeText,
    width: overview.value?.data?.[0]?.preview?.image?.width,
    height: overview.value?.data?.[0]?.preview?.image?.height,
    type: overview.value?.data?.[0]?.preview?.image?.mime,
  }),
  ogUrl: () => `https://duetocodes.com${route.path}`,
  ogType: 'website',
  twitterTitle: () => `${$t('KnowYourViewport')} - ${$t('Projects')} | duetocodes`,
  twitterDescription: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  twitterCard: 'summary_large_image',
  twitterImage: () => ({
    url: overview.value?.data?.[0]?.preview?.image?.url,
    alt: overview.value?.data?.[0]?.preview?.image?.alternativeText,
    width: overview.value?.data?.[0]?.preview?.image?.width,
    height: overview.value?.data?.[0]?.preview?.image?.height,
    type: overview.value?.data?.[0]?.preview?.image?.mime,
  }),
});

const deviceIcon = computed(() => {
  const temp = {
    class: '',
    icon: '',
  };

  switch (device.value.orientation.angle) {
    case 90:
      temp.class = 'rotate-90';
      break;
    case 180:
      temp.class = 'rotate-180';
      break;
    case 270:
      temp.class = 'rotate-270';
      break;
    default:
      temp.class = '';
      break;
  }

  switch (device.value.form) {
    case 'Phone':
      temp.icon = 'material-symbols:phone-iphone-outline';
      break;
    case 'Tablet':
      temp.icon = 'material-symbols:tablet-mac-outline';
      break;
    default:
      temp.icon = 'material-symbols:desktop-mac-outline';
      break;
  }

  return temp;
});
</script>
