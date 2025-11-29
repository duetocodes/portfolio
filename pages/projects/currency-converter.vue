<template>
  <div>
    <MDC
      v-if="overview?.data?.[0]?.description"
      :value="overview.data[0].description"
      class="line-clamp-5 text-md text-pretty whitespace-pre-line prose dark:prose-invert text-muted [&_a:after]:content-['_↗']"
      tag="article" />

    <UForm
      ref="form"
      class="mt-8"
      :schema="CurrencyFormSchema"
      :state="state">
      <UCard :ui="{ body: 'space-y-8' }">
        <div>
          <UBadge
            color="warning"
            variant="soft"
            :label="$t('Simulation')" />
        </div>

        <UFormField
          name="amount"
          :ui="{ root: 'h-[92px]' }">
          <UInput
            v-model="state.amount"
            size="xl"
            inputmode="decimal"
            autocomplete="off"
            :ui="{ root: 'w-full', base: 'ring-0 text-5xl ps-22', leading: 'text-3xl' }"
            :placeholder="(state.source && !state.source?.supportsDecimals) ? '0' : '0.00'"
            @update:model-value="handleNumberInput">
            <template
              #leading>
              <span
                v-if="state.source?.symbol"
                class="text-3xl text-muted">
                {{ state.source.symbol }}
              </span>
              <span
                v-else
                class="flex items-center">
                <UIcon
                  name="material-symbols:universal-currency-alt-outline-rounded"
                  class="shrink-0 size-8 text-muted" />
              </span>
            </template>
          </UInput>
        </UFormField>

        <div class="flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-center">
          <UFormField
            name="source"
            class="w-full md:basis-11/24"
            :help="state.source && !state.source?.supportsDecimals ? $t('DecimalsAreNotSupportedForCurrency', { currency: state.source.code }) : ''"
            :ui="{ root: 'md:h-[92px]' }">
            <USelectMenu
              v-model="state.source"
              size="xl"
              class="w-full h-14"
              variant="subtle"
              color="neutral"
              icon="material-symbols:flag-outline-rounded"
              selected-icon="material-symbols:check"
              trailing-icon="material-symbols:keyboard-arrow-down"
              :placeholder="$t('From')"
              :items="currenciesList.filter(item => item?.code !== state.target?.code)"
              :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
              }"
              @update:model-value="onChangeSource"
              @update:open="onOpenSelect">
              <template #empty>
                {{ statusCurrencies === 'pending' ? $t('Loading') : $t('NoData') }}
              </template>

              <template
                v-if="state.source"
                #leading>
                <UAvatar
                  size="xs"
                  :src="state.source?.avatar?.src || undefined" />
              </template>
            </USelectMenu>
          </UFormField>

          <UButton
            class="rounded-full scale-110 transform md:-translate-y-1/2"
            :class="{ 'max-md:rotate-90': !(errorCurrencies || errorRates) }"
            :icon="(errorCurrencies || errorRates) ? undefined: 'material-symbols:compare-arrows-rounded'"
            size="xl"
            :label="(errorCurrencies || errorRates) ? $t('TryAgain') : undefined"
            :aria-label="(errorCurrencies || errorRates) ? $t('TryAgain') : undefined"
            :color="(errorCurrencies || errorRates) ? 'error' : 'primary'"
            variant="soft"
            loading-icon="material-symbols:app-badging-outline"
            :loading="statusCurrencies === 'pending' || statusRates === 'pending'"
            @click="() => {
              onClickButton();
              form?.clear('source');
              form?.clear('target');
            }" />

          <UFormField
            name="target"
            class="w-full md:basis-11/24"
            :ui="{ root: 'md:h-[92px]' }">
            <USelectMenu
              v-model="state.target"
              size="xl"
              class="w-full h-14"
              variant="subtle"
              color="neutral"
              icon="material-symbols:flag-outline-rounded"
              selected-icon="material-symbols:check"
              trailing-icon="material-symbols:keyboard-arrow-down"
              :placeholder="$t('To')"
              :items="currenciesList.filter(item => item?.code !== state.source?.code)"
              :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
              }"
              @update:open="onOpenSelect">
              <template #empty>
                {{ statusCurrencies === 'pending' ? $t('Loading') : $t('NoData') }}
              </template>

              <template
                v-if="state.target"
                #leading>
                <UAvatar
                  size="xs"
                  :src="state.target?.avatar?.src || undefined" />
              </template>
            </USelectMenu>
          </UFormField>
        </div>

        <div class="space-y-4">
          <div
            class="break-all font-semibold tracking-wide text-center text-xl text-default">
            {{ conversionResult }}
          </div>
          <div
            class="whitespace-pre-line text-center text-sm text-default">
            <p>
              {{ exchangeRate }}
            </p>
            <NuxtTime
              v-if="rates"
              :datetime="rates[0].time"
              :locale="locale"
              year="numeric"
              month="long"
              day="numeric"
              hour="2-digit"
              minute="2-digit" />
          </div>
          <div
            v-if="recentPairs.length"
            class="flex justify-end gap-2">
            <UButton
              v-for="pair in recentPairs"
              :key="pair"
              size="xs"
              :label="pair"
              :aria-label="pair"
              color="neutral"
              variant="outline"
              :ui="{ label: 'font-light text-muted' }"
              @click="onClickRecentPairs(pair)" />
          </div>
        </div>

        <template #footer>
          <p class="prose text-muted">
            {{ $t('References') }}
          </p>
          <ul class="text-sm list-disc list-inside text-muted">
            <li>
              <UButton
                color="neutral"
                variant="link"
                to="https://wise.com/gb/mid-market-rate"
                target="_blank">
                {{ $t('MidMarketExchangeRate') }}
                <UIcon
                  name="material-symbols:info-outline-rounded"
                  class=" text-muted" />
              </UButton>
            </li>
          </ul>
        </template>
      </UCard>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import type { ProjectItemDataSchema } from '~/schemas';
import {
  type CurrencyItemSchema,
  type RatesItemSchema,
  AmountSchema,
  CurrencySelectSchema,
} from '~/schemas/currency-converter';

definePageMeta({
  layout: 'project-item',
});

type ProjectItemData = z.infer<typeof ProjectItemDataSchema>;
type CurrencyItem = z.infer<typeof CurrencyItemSchema>;
type RatesItem = z.infer<typeof RatesItemSchema>;

const form = useTemplateRef('form');

const { t: $t, locale } = useI18n();
const nuxtApp = useNuxtApp();
const route = useRoute();
const toast = useToast();

const LocalizedAmountSchema = AmountSchema
  .refine(val => val.trim().length > 0,
    { message: $t('Required') },
  )
  .refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  },
  {
    message: $t('MustBeOperatorLimit', { operator: $t('greaterthan'), limit: '0' }),
  },
  );

const _localisedCurrencySelectSchema = CurrencySelectSchema
  .required()
  .nullable()
  .refine(
    Boolean,
    {
      message: $t('Required'), // overwrites built-in message,
    },
  );

const CurrencyFormSchema = z.object({
  amount: LocalizedAmountSchema,
  source: _localisedCurrencySelectSchema,
  target: _localisedCurrencySelectSchema,
});

type FormSchema = z.input<typeof CurrencyFormSchema>;
type CurrencySelect = z.infer<typeof _localisedCurrencySelectSchema>;

const state = reactive<FormSchema>({
  amount: '',
  source: null,
  target: null,
});

const {
  // non-crucial data
  data: overview,
} = useFetch<{ data: ProjectItemData[] }>(
  '/api/projects',
  {
    method: 'GET',
    key: route.fullPath,
    getCachedData(key) {
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      return data;
    },
    query: {
      'locale': locale.value,
      'filters[slugId][$eq]': 'currency-converter',
      'populate[preview][populate][image][fields]': ['url', 'alternativeText', 'width', 'height', 'mime'],
      'fields': 'description',
    },
  },
);

const recentPairs = useCookie<string[]>('dtc-recent-curr-pairs', {
  default: () => [],
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

useHead({
  link: [{
    rel: 'canonical',
    href: `https://duetocodes.com${route.fullPath}`,
  }],
});

useSeoMeta({
  title: () => `${$t('CurrencyConverter')} - ${$t('Projects')} | duetocodes`,
  description: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogSiteName: () => `${$t('CurrencyConverter')} - ${$t('Projects')} | duetocodes`,
  ogTitle: () => `${$t('CurrencyConverter')} - ${$t('Projects')} | duetocodes`,
  ogDescription: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogImage: () => ({
    url: overview.value?.data?.[0]?.preview?.image?.url,
    alt: overview.value?.data?.[0]?.preview?.image?.alternativeText,
    width: overview.value?.data?.[0]?.preview?.image?.width,
    height: overview.value?.data?.[0]?.preview?.image?.height,
    type: overview.value?.data?.[0]?.preview?.image?.mime,
  }),
  ogUrl: () => `https://duetocodes.com${route.fullPath}`,
  ogType: 'website',
  twitterTitle: () => `${$t('CurrencyConverter')} - ${$t('Projects')} | duetocodes`,
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

const {
  data: currencies,
  status: statusCurrencies,
  execute: fetchCurrencies,
  error: errorCurrencies,
} = await useLazyFetch<CurrencyItem[]>(
  '/api/wise-currencies',
  {
    method: 'GET',
    immediate: false,
    onResponseError() {
      toast.add({
        title: $t('ItemNotFound', { item: $t('List') }),
        color: 'error',
      });
    },
  },
);

const {
  data: rates,
  status: statusRates,
  execute: fetchRates,
  error: errorRates,
} = await useLazyFetch<RatesItem[] | null>(
  '/api/wise-rates',
  {
    method: 'GET',
    immediate: false,
    watch: false,
    onRequest({ options }) {
      options.query = {
        source: state.source?.code,
        target: state.target?.code,
      };
    },
    onResponse() {
      if (state.source?.code && state.target?.code) {
        const pair = `${state.source.code}-${state.target.code}`;
        recentPairs.value = [pair, ...recentPairs.value.filter(p => p !== pair)].slice(0, 3);
      }
    },
    onResponseError() {
      toast.add({
        title: $t('ItemNotFound', { item: $t('Rates') }),
        description: `${state.source?.code} - ${state.target?.code}`,
        color: 'error',
      });
    },
  },
);

watch(
  () => [state.source, state.target],
  ([newSource, newTarget]) => {
    if (newSource?.code && newTarget?.code)
      fetchRates();
  },
);

const conversionResult = computed((): string => {
  if (rates.value && state.amount && state.source && state.target) {
    const calculated = (Number(state.amount) * Number(rates.value[0].rate));

    const amt = getLocalizedFiat(state.amount);
    const result = getLocalizedFiat(calculated.toString());

    return `${state.source.symbol} ${amt} = ${result} ${state.target.code}`;
  }
  else return '';
});

const exchangeRate = computed((): string => {
  if (rates.value && state.source && state.target) {
    return `${state.source.symbol} 1 = ${rates.value[0].rate} ${state.target.code}`;
  }
  else return '';
});

const currenciesList = computed((): CurrencySelect[] | [] => {
  if (currencies.value?.length) {
    return currencies.value.map((item) => {
      const countryCode = item?.code?.toLowerCase() || 'wise';
      const countryName = item?.name ? `(${item.name})` : '';
      return {
        label: `${item.code} ${countryName}`,
        value: item.code,
        avatar: {
          src: `https://wise.com/web-art/assets/flags/${countryCode}.svg`,
          alt: item.code,
        },
        ...item,
      };
    });
  }
  else return [];
});

const getLocalizedFiat = (val: string) => {
  const str = Number(val);
  return new Intl.NumberFormat(locale.value, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(str);
};

const onOpenSelect = async () => {
  if (!currencies.value?.length) {
    await fetchCurrencies();
  }
};

const onChangeSource = (selected: CurrencySelect | null) => {
  if (!selected?.supportsDecimals) {
    const truncated = state.amount?.split('.')[0];
    nextTick(() => {
      if (truncated) state.amount = truncated;
    });
  }
};

const onClickButton = () => {
  if (errorCurrencies.value) fetchCurrencies();
  else if (errorRates.value) fetchRates();
  else [state.source, state.target] = [state.target, state.source];
};

const handleNumberInput = async (input: string) => {
  let formatted = '';
  if (state.source && !state.source?.supportsDecimals) {
    formatted = input.replace(/[^0-9]/g, '').replace(/^0+/, '');
  }
  else {
    // allow only 0-9 and a single decimal point, and 2 decimal places
    let sanitized = input.replace(/[^\d.]/g, '').replace(/(\..*?)\./g, '$1');
    // prepend 0 if the string starts with a decimal point
    if (sanitized?.startsWith('.')) {
      sanitized = '0' + sanitized;
    }
    // limit string to 2 decimal places
    formatted = sanitized.replace(/^(\d+)(\.\d{0,2})?.*$/, '$1$2');
  }

  nextTick(() => {
    state.amount = formatted;
  });
};

const onClickRecentPairs = async (pair: string) => {
  if (!currenciesList.value.length)
    await fetchCurrencies();

  const arrayed = pair.split('-');

  const source = currenciesList.value.find(item => item?.code === arrayed[0]);
  const target = currenciesList.value.find(item => item?.code === arrayed[1]);
  if (source)
    state.source = source;
  if (target)
    state.target = target;
};
</script>
