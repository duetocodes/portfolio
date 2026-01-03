<template>
  <div>
    <MDC
      v-if="overview?.data?.[0]?.description"
      :value="overview.data[0].description"
      class="line-clamp-5 text-md text-pretty whitespace-pre-line prose dark:prose-invert text-muted [&_a:after]:content-['_↗']"
      tag="article" />

    <ClientOnly>
      <div
        class="pt-4 sm:pt-8">
        <UCard
          variant="subtle"
          :ui="{
            root: 'max-w-sm mx-auto',
            header: 'flex items-center justify-between',
            body: 'space-y-4',
          }">
          <template #header>
            <span class="font-semibold">
              {{ TEXTS.Viewport }}
            </span>
            <UIcon
              class="size-8 text-muted"
              :name="indicatorIcon"
              :class="[indicatorClass]" />
          </template>

          <UFormField
            :label="TEXTS.Display"
            :ui="{
              label: 'text-base',
              container: 'text-base text-muted space-y-1',
            }">
            <div class="border border-muted/50 divide-y divide-muted/50 rounded-sm">
              <div
                v-if="device.screen.devicePixelRatio > 1"
                class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span
                  class="col-span-9">
                  {{ TEXTS.Resolution }}
                </span>
                <span class="text-center col-span-15">
                  {{ device.screen.width * device.screen.devicePixelRatio }} W × {{ device.screen.height * device.screen.devicePixelRatio }} H
                </span>
              </div>

              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span
                  class="col-span-9">
                  {{ TEXTS.Viewport }}
                </span>
                <span class="text-center col-span-15">
                  {{ device.screen.width }} W × {{ device.screen.height }} H
                </span>
              </div>

              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span
                  class="col-span-9">
                  {{ TEXTS.Form }}
                </span>
                <span
                  v-if="device.form"
                  class="text-center col-span-15">
                  {{ TEXTS[device.form] || '--' }}
                  <span class="italic text-sm"> ({{ TEXTS.estimated }})</span>
                </span>
              </div>

              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span class="col-span-9">
                  {{ TEXTS.Orientation }}
                </span>
                <span class="text-center col-span-15">
                  {{ device.orientation.type }}
                </span>
              </div>

              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span class="col-span-9">
                  {{ TEXTS.Rotation }}
                </span>
                <span class="text-center col-span-15">
                  {{ device.orientation.angle }} °
                </span>
              </div>

              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span class="col-span-9">
                  {{ TEXTS.TouchScreen }}
                </span>
                <span class="text-center col-span-15">
                  {{ device.media.hasTouch ? TEXTS.Yes : TEXTS.No }}
                </span>
              </div>

              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span class="col-span-9">
                  {{ TEXTS.Colour }}
                </span>
                <span class="text-center col-span-15">
                  {{ device.screen.colorDepth }} bit
                </span>
              </div>

              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <section class="flex gap-x-4 items-center col-span-9">
                  <span>
                    DPR
                  </span>
                  <UTooltip
                    v-model:open="isTooltip"
                    :delay-duration="200"
                    :ui="{
                      content: 'p-4 text-base flex-col items-start h-auto',
                    }">
                    <template #content>
                      Device Pixel Ratio
                      <ul class="relative p-2 ml-2 list-disc space-y-2">
                        <li>{{ TEXTS.Tip1DPR }}</li>
                        <li>{{ TEXTS.Tip2DPR }}</li>
                        <li>{{ TEXTS.Tip3DPR }}</li>
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
                <span class="text-center col-span-15">
                  {{ device.screen.devicePixelRatio }}
                </span>
              </div>
            </div>
          </UFormField>

          <UFormField
            :label="TEXTS.Page"
            :ui="{
              label: 'text-base',
              container: 'text-base text-muted',
            }">
            <div class="border border-muted/50 divide-y divide-muted/50 rounded-sm">
              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span class="col-span-9">
                  {{ TEXTS.Layout }}
                </span>
                <span class="text-center col-span-15">
                  {{ device.clientWidth }} W × {{ device.clientHeight }} H
                </span>
              </div>
            </div>
          </UFormField>

          <UFormField
            :label="TEXTS.System"
            :ui="{
              label: 'text-base',
              container: 'text-base text-muted',
            }">
            <div class="border border-muted/50 divide-y divide-muted/50 rounded-sm">
              <template v-if="device.ua.success">
                <div
                  v-if="device.ua.platform"
                  class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                  <span class="col-span-9">
                    {{ TEXTS.Platform }}
                  </span>
                  <span class="truncate text-center col-span-15">
                    {{ device.ua.platform }} {{ device.ua.platformVersion }}
                  </span>
                </div>
              </template>

              <div class="pl-2 grid items-center divide-x divide-muted/50 grid-cols-24">
                <span class="col-span-9">
                  {{ TEXTS.Appearance }}
                </span>
                <span class="text-center col-span-15">
                  {{ device.appearance ? TEXTS.Dark : TEXTS.Light }}
                </span>
              </div>
            </div>
          </UFormField>
        </UCard>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { ProjectItemPageMeta } from '~/types';
import type { ProjectItemDataSchema } from '~/schemas';
import type { z } from 'zod';

const nuxtApp = useNuxtApp();
const route = useRoute();
const { t: $t, locale } = useI18n();
const { TEXTS } = useFolioI18n();

const device = useClientDevice();
const isTooltip = ref(false);

const SLUG_ID = 'know-your-viewport';

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

const indicatorIcon = computed(() => {
  switch (device.value.form) {
    case 'Phone':
      return 'material-symbols:phone-iphone-outline';
    case 'Tablet':
      return 'material-symbols:tablet-mac-outline';
    case 'Desktop':
      return 'material-symbols:desktop-mac-outline';
    default: {
      if (device.value.simpleOrientation === 'portrait')
        return 'material-symbols:stay-current-portrait-outline-sharp';
      else
        return 'material-symbols:stay-current-landscape-outline-sharp';
    }
  }
});

const indicatorClass = computed(() => {
  if (device.value.form === 'Desktop')
    return 'rotate-none';

  switch (device.value.orientation.type) {
    case 'portrait-secondary':
      return 'rotate-180';
    case 'landscape-primary':
      return 'rotate-270';
    case 'landscape-secondary':
      return 'rotate-90';
    default:
      return 'rotate-none';
  }
});
</script>
