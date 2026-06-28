<template>
  <div>
    <MDC
      v-if="overview?.data?.[0]?.description"
      :value="overview.data[0].description"
      class="line-clamp-5 text-md text-pretty whitespace-pre-line prose dark:prose-invert text-muted [&_a:after]:content-['_↗']"
      tag="article" />

    <UTimeline
      v-model="step"
      :items="items"
      color="neutral"
      class="mx-auto max-w-96 pt-4 sm:pt-8">
      <template #demoform-description>
        <div class="mt-2 h-[65px]">
          <UForm
            ref="form"
            class="w-[300px]"
            :state="state"
            :schema="schema"
            @submit="onSubmit">
            <UFieldGroup>
              <UFormField name="demoinput">
                <UInput
                  v-model="state.demoinput"
                  class="w-48"
                  :placeholder="TEXTS.TypeAnything" />
                <UButton
                  :label="turnstile?.widgetId ? TEXTS.Reset : TEXTS.Submit"
                  color="neutral"
                  variant="subtle"
                  :disabled="isLoading"
                  :trailing-icon="turnstile?.widgetId ? 'material-symbols:restart-alt-rounded' : 'material-symbols:send-outline'"
                  @click="turnstile?.widgetId ? onReset() : form?.submit()" />
              </UFormField>
            </UFieldGroup>
          </UForm>
        </div>
      </template>

      <template #clientside-title="{ item }">
        <div class="flex justify-between">
          {{ TEXTS.Validation }}
          <UBadge
            :label="item.badgeLabel"
            color="neutral"
            variant="outline"
            size="sm" />
        </div>
      </template>
      <template #clientside-description>
        <div class="mt-2 w-full h-[65px]">
          <CloudflareTurnstile
            ref="turnstile"
            :site-key="settings.siteKey"
            :action="TURNSTILE_ACTION"
            @on-success="onSuccessClient"
            @on-error="onErrorClient" />

          <div
            v-if="!turnstile?.widgetId">
            <div class="flex justify-between">
              <USwitch
                v-model="settings.simulateClientFail"
                size="sm"
                :label="TEXTS.SimulateFailure"
                @change="() => {
                  if (settings.simulateServerFail) {
                    settings.simulateServerFail = false;
                  }
                }">
              </USwitch>
              <UButton
                to="https://developers.cloudflare.com/turnstile/troubleshooting/testing/#test-sitekeys"
                target="_blank"
                icon="material-symbols:help-outline"
                color="neutral"
                variant="link"
                size="sm"
                :ui="{ base: 'p-0' }">
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <template #serverside-title="{ item }">
        <div class="flex justify-between">
          {{ TEXTS.Validation }}
          <UBadge
            :label="item.badgeLabel"
            color="neutral"
            variant="outline"
            size="sm" />
        </div>
      </template>
      <template #serverside-description>
        <div class="mt-2">
          <UAlert
            v-if="step === 2 && result && (result.success || !result.success)"
            class="w-[300px]"
            variant="soft"
            :title="result.success ? TEXTS.Successful : TEXTS.Unsuccessful"
            :color="result.success ? 'success' : 'error'">
            <template #description>
              <div class="flex flex-col gap-2">
                <span v-if="result?.success">
                  {{ TEXTS.Validated }}
                  {{ result?.challenge_ts }}
                </span>
                <span v-else>
                  <span v-if="result?.['error-codes']">
                    {{ result?.['error-codes'].join(', ') }}.
                  </span>
                </span>
              </div>
            </template>
          </UAlert>
          <div
            v-else
            class="flex justify-between">
            <USwitch
              v-model="settings.simulateServerFail"
              size="sm"
              :disabled="isLoading || settings.simulateClientFail"
              :label="TEXTS.SimulateFailure">
            </USwitch>
            <UButton
              to="https://developers.cloudflare.com/turnstile/troubleshooting/testing/#test-secret-keys"
              target="_blank"
              icon="material-symbols:help-outline"
              color="neutral"
              variant="link"
              size="sm"
              :ui="{ base: 'p-0' }">
            </UButton>
          </div>
        </div>
      </template>
    </UTimeline>
  </div>
</template>

<script setup lang="ts">
import z from 'zod';
import type { ProjectItemPageMeta } from '~~/types';
import type { ProjectItemDataSchema } from '~~/schemas';
import type { TurnstileToken, CloudflareTurnstileExpose, CloudflareSiteVerifyResponse } from '~~/schemas/cloudflare-turnstile';
import type { TurnstileDemoPayload } from '~~/schemas/turnstile-demo-form';
import type { TimelineItem, FormSubmitEvent } from '@nuxt/ui';

const nuxtApp = useNuxtApp();
const route = useRoute();
const config = useRuntimeConfig();

const { t: $t, locale } = useI18n();
const { TEXTS } = useNonReactiveTranslation();

const SLUG_ID = 'cloudflare-turnstile-demo';
const TURNSTILE_ACTION = 'turnstile-demo';

type ProjectItemDataObj = z.infer<typeof ProjectItemDataSchema>;

definePageMeta({
  layout: 'project-item',
  slugId: SLUG_ID,
  slugLabel: 'TurnstileDemo',
} satisfies ProjectItemPageMeta);

const step = ref(0);
const form = useTemplateRef<{ submit: () => void }>('form');
const turnstile = useTemplateRef<CloudflareTurnstileExpose>('turnstile');
const isLoading = ref(false);
const result = ref<CloudflareSiteVerifyResponse | null>(null);

const schema = z.object({
  demoinput: z.string().min(3, 'Minimum 3 characters').max(100, 'Maximum 100 characters'),
});
const state = reactive({
  demoinput: '',
});

const settings = reactive({
  simulateClientFail: false,
  simulateServerFail: false,
  siteKey: '',
});

type Schema = z.output<typeof schema>
const onSubmit = (_event: FormSubmitEvent<Schema>) => {
  step.value = 1;

  if (settings.simulateClientFail) {
    settings.siteKey = config.public.demoTurnstileSiteKey;
  }

  nextTick(() => {
    turnstile.value?.renderThenExecute();
  });
};

const onReset = () => {
  step.value = 0;
  state.demoinput = '';
  settings.simulateClientFail = false;
  settings.simulateServerFail = false;
  settings.siteKey = '';
  result.value = null;
  turnstile.value?.resetThenRemove();
};

const items = computed(() => {
  let icon;
  switch (step.value) {
    case 1: {
      if (!result.value && isLoading.value)
        icon = 'material-symbols:app-badging-outline';
      else
        icon = 'material-symbols:pending-actions';
      break;
    }
    case 2: {
      if (result.value) {
        if (result.value.success)
          icon = 'material-symbols:verified-outline';
        else
          icon = 'material-symbols:verified-off-outline';
      }
      break;
    }
    default:
      icon = 'material-symbols:pending-actions';
      break;
  }

  return [
    {
      slot: 'demoform' as const,
      value: 'demoform',
      title: TEXTS.Form,
      icon: 'material-symbols:edit-document-outline',
      ui: {
        indicator: 'text-red-400',
      },
    },
    {
      slot: 'clientside' as const,
      badgeLabel: `${TEXTS.ClientSide}`,
      icon: 'material-symbols:widgets-outline',
      value: 'development',
    },
    {
      slot: 'serverside' as const,
      badgeLabel: `${TEXTS.ServerSide} `,
      icon: icon,
      ui: {
        indicator: isLoading.value ? 'animate-spin' : undefined,
      },
    },
  ] satisfies TimelineItem[];
});

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

useSeoMeta({
  title: () => `${TEXTS.TurnstileDemo} - ${TEXTS.Projects} | duetocodes`,
  description: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogSiteName: () => `${TEXTS.TurnstileDemo} - ${TEXTS.Projects} | duetocodes`,
  ogTitle: () => `${TEXTS.TurnstileDemo} - ${TEXTS.Projects} | duetocodes`,
  ogDescription: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogImage: () => ({
    url: overview.value?.data?.[0]?.preview?.image?.url,
    alt: overview.value?.data?.[0]?.preview?.image?.alternativeText,
    width: overview.value?.data?.[0]?.preview?.image?.width,
    height: overview.value?.data?.[0]?.preview?.image?.height,
    type: overview.value?.data?.[0]?.preview?.image?.mime,
  }),
  ogType: 'website',
  twitterTitle: () => `${TEXTS.TurnstileDemo} - ${TEXTS.Projects} | duetocodes`,
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

const onSuccessClient = (token: TurnstileToken) => {
  isLoading.value = true;

  $fetch(
    '/api/turnstile-demo-form',
    {
      method: 'POST',
      body: {
        token,
        demoinput: state.demoinput,
        isSimulateFail: settings.simulateServerFail,
        action: TURNSTILE_ACTION,
      } satisfies TurnstileDemoPayload,
    },
  )
    .then((res: CloudflareSiteVerifyResponse) => {
      if (res.challenge_ts) {
        const date = new Date(res.challenge_ts);
        const localized = new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);

        res.challenge_ts = localized;
      }
      result.value = res;
    })
    .catch(() => {
      result.value = {
        'success': false,
        'error-codes': [$t('UnexpectedErrorOccurred')],
      };
    })
    .finally(() => {
      step.value = 2;
      isLoading.value = false;
    });
};

const onErrorClient = () => {
  result.value = {
    success: false,
  };
  step.value = 2;
  isLoading.value = false;
};
</script>
