<template>
  <div>
    <AppLoadingIndicator :is-loading="statusChart === 'pending' && !errorChart" />

    <AppError
      :has-error="statusChart === 'error' || Boolean(errorChart)"
      :error="errorChart"
      :status="statusChart"
      @try-again="refresh" />

    <template v-if="chart">
      <UBreadcrumb
        class="mt-8"
        :items="crumbItems"
        :ui="{ link: 'text-lg' }" />

      <MDC
        v-if="overview?.data?.[0]?.description"
        :value="overview?.data[0].description"
        class="text-md line-clamp-5 text-pretty whitespace-pre-line prose dark:prose-invert text-muted [&_a:after]:content-['_↗']"
        tag="article" />
      <p
        v-else
        class="text-md prose text-muted">
        {{ $t('SelfDevelopedApplications', 1) }}
      </p>

      <div class="mt-8 flex flex-wrap [&>*]:py-2 [&>*]:px-2 md:[&>*]:px-4 sm:divide-x-1 sm:divide-dotted sm:divide-[var(--ui-border-muted)] border-y-1 border-dotted border-muted">
        <div class="flex gap-4">
          <UFormField :label="$t('From')">
            <USelect
              v-model="selectedFromYear"
              size="xs"
              class="w-20"
              :disabled="statusChart === 'pending'"
              :items="yearsList"
              @change="onChange('from')" />
          </UFormField>
          <UFormField :label="$t('To')">
            <USelect
              v-model="selectedToYear"
              size="xs"
              class="w-20"
              :disabled="statusChart === 'pending'"
              :items="yearsList"
              @change="onChange('to')" />
          </UFormField>
        </div>
        <UFormField :label="$t('Mode')">
          <div class="flex items-center gap-2">
            <span
              class="text-sm text-default transition-opacity"
              :class="[{ 'opacity-40': isSpread }]">
              {{ $t('Standard') }}
            </span>
            <USwitch
              v-model="isSpread"
              size="sm"
              :ui="{ base: 'data-[state=unchecked]:bg-slate-300 data-[state=checked]:bg-slate-300' }" />
            <UTooltip
              :text="$t('SeeYieldCurveInversion')"
              :delay-duration="0">
              <span
                class="flex items-center text-sm text-default transition-opacity"
                :class="[{ 'opacity-40': !isSpread }]">
                {{ $t('Spread') }}
              </span>
            </UTooltip>
          </div>
        </UFormField>
        <UFormField
          v-if="!isSpread"
          :label="$t('Standard')"
          required>
          <UCheckboxGroup
            v-model="termCheckboxes"
            required
            orientation="horizontal"
            :disabled="statusChart === 'pending'"
            :items="termItems"
            :ui="{ indicator: 'bg-transparent text-default' }">
            <template #label="{ item }">
              <span :class="['transition-opacity', { 'opacity-40': !termCheckboxes.includes(item.value) }]">
                {{ item.label }}
              </span>
            </template>
          </UCheckboxGroup>
        </UFormField>
        <UFormField
          v-else
          :label="$t('Spread')"
          required>
          <UCheckboxGroup
            v-model="spreadCheckboxes"
            required
            orientation="horizontal"
            :disabled="statusChart === 'pending'"
            :items="spreadItems"
            :ui="{ indicator: 'bg-transparent text-default', fieldset: 'max-w-72' }">
            <template #label="{ item }">
              <span :class="['transition-opacity', { 'opacity-40': !spreadCheckboxes.includes(item.value) }]">
                {{ item.label }}
              </span>
            </template>
          </UCheckboxGroup>
        </UFormField>
        <div class="sm:ml-auto flex gap-2 items-center">
          <UButton
            size="sm"
            color="neutral"
            variant="link"
            icon="material-symbols:format-list-bulleted"
            :label="$t('GoToTarget', { target: $t('List') })"
            :aria-label="$t('GoToTarget', { target: $t('List') })"
            :disabled="statusChart === 'pending'"
            :to="localePath('/projects')" />
          <UButton
            size="sm"
            color="neutral"
            variant="solid"
            icon="material-symbols:chart-data-outline"
            loading-icon="material-symbols:app-badging-outline"
            :label="$t('View')"
            :aria-label="$t('View')"
            :loading="statusChart === 'pending'"
            @click="() => refresh()" />
        </div>
      </div>

      <LineChart
        class="mt-4"
        :data="chartDataComputed"
        :categories="categories"
        :height="500"
        :x-num-ticks="4"
        :y-num-ticks="4"
        :x-tick-line="true"
        :y-tick-line="true"
        x-domain-line
        y-domain-line
        :legend-position="LegendPosition.Top"
        :x-formatter="xFormatter"
        y-label="%" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { TreasuryChartRowData, ProjectItemData } from '~/types';
import type { BreadcrumbItem } from '@nuxt/ui';

const { t: $t, locale } = useI18n();
const nuxtApp = useNuxtApp();
const route = useRoute();
const localePath = useLocalePath();

const isSpread = ref(false);
const termCheckboxes = ref(['3mth', '2yr', '10yr']);
const spreadCheckboxes = ref(['2yr3mth', '10yr3mth', '10yr2yr']);
const selectedFromYear = ref((new Date().getFullYear() - 1).toString());
const selectedToYear = ref(new Date().getFullYear().toString());
const yearsList = ref<string[]>([]);

const crumbItems = computed<BreadcrumbItem[]>(() => [
  {
    to: localePath('/projects'),
    label: $t('Projects'),
  },
  {
    to: route.fullPath,
    label: $t('TreasuryYieldVisualiser'),
  },
]);

const {
  status: statusChart,
  refresh,
  data: chart,
  error: errorChart,
} = useFetch<TreasuryChartRowData[]>(
  '/api/treasury-yield-scraper',
  {
    method: 'GET',
    query: {
      from: selectedFromYear,
      to: selectedToYear,
      term: termCheckboxes,
    },
    watch: false,
  },
);

const {
  // non-crucial data
  data: overview,
} = useFetch<ProjectItemData>(
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
      'filters[identifier][$eq]': 'treasury-yield-visualiser',
      'populate[preview][populate][image][fields]': ['url', 'alternativeText', 'width', 'height', 'mime'],
      'fields': 'description',
    },
  },
);

useSeoMeta({
  title: () => $t('TreasuryYieldVisualiser'),
  ogSiteName: () => `Freddie — ${$t('meta.title')}`,
  ogTitle: () => $t('TreasuryYieldVisualiser'),
  ogDescription: 'duetocodes', // cant use .description due to markdown nature
  ogImage: () => ({
    url: overview.value?.data?.[0].preview?.image?.url,
    alt: overview.value?.data?.[0].preview?.image?.alternativeText,
    width: overview.value?.data?.[0].preview?.image?.width,
    height: overview.value?.data?.[0].preview?.image?.height,
    type: overview.value?.data?.[0].preview?.image?.mime,
  }),
  ogUrl: () => `https://duetocodes.com${route.fullPath}`,
  ogType: 'website',
  twitterTitle: () => $t('TreasuryYieldVisualiser'),
  twitterDescription: 'duetocodes',
  twitterCard: 'summary_large_image',
  twitterImage: () => ({
    url: overview.value?.data?.[0].preview?.image?.url,
    alt: overview.value?.data?.[0].preview?.image?.alternativeText,
    width: overview.value?.data?.[0].preview?.image?.width,
    height: overview.value?.data?.[0].preview?.image?.height,
    type: overview.value?.data?.[0].preview?.image?.mime,
  }),
});

const termItems = computed(() => [
  {
    label: `3${$t('month')}`,
    value: '3mth',
    disabled: termCheckboxes.value.find(item => item === '3mth') && termCheckboxes.value.length === 1,
  },
  {
    label: `2${$t('year')}`,
    value: '2yr',
    disabled: termCheckboxes.value.find(item => item === '2yr') && termCheckboxes.value.length === 1,
  },
  {
    label: `10${$t('year')}`,
    value: '10yr',
    disabled: termCheckboxes.value.find(item => item === '10yr') && termCheckboxes.value.length === 1,
  },
]);

const spreadItems = computed(() => [
  {
    label: `2${$t('year')}-3${$t('month')}`,
    value: '2yr3mth',
    disabled: spreadCheckboxes.value.find(item => item === '2yr3mth') && spreadCheckboxes.value.length === 1,
  },
  {
    label: `10${$t('year')}-3${$t('month')}`,
    value: '10yr3mth',
    disabled: spreadCheckboxes.value.find(item => item === '10yr3mth') && spreadCheckboxes.value.length === 1,
  },
  {
    label: `10${$t('year')}-2${$t('year')}`,
    value: '10yr2yr',
    disabled: spreadCheckboxes.value.find(item => item === '10yr2yr') && spreadCheckboxes.value.length === 1,
  },
]);

const categories = computed(() => {
  const obj: Record<string, globalThis.BulletLegendItemInterface> = {};

  if (isSpread.value) {
    if (spreadCheckboxes.value.includes('2yr3mth')) {
      obj['2yr3mth'] = {
        name: `2${$t('year')}-3${$t('month')}`,
        color: '#17becf',
      };
    }
    if (spreadCheckboxes.value.includes('10yr3mth')) {
      obj['10yr3mth'] = {
        name: `10${$t('year')}-3${$t('month')}`,
        color: '#bcbd22',
      };
    }
    if (spreadCheckboxes.value.includes('10yr2yr')) {
      obj['10yr2yr'] = {
        name: `10${$t('year')}-2${$t('year')}`,
        color: '#7f7f7f',
      };
    }
  }
  else {
    if (termCheckboxes.value.includes('3mth')) {
      obj['3mth'] = {
        name: `3${$t('month')}`,
        color: '#1f77b4',
      };
    }
    if (termCheckboxes.value.includes('2yr')) {
      obj['2yr'] = {
        name: `2${$t('year')}`,
        color: '#2ca02c',
      };
    }
    if (termCheckboxes.value.includes('10yr')) {
      obj['10yr'] = {
        name: `10${$t('year')}`,
        color: '#ff7f0e',
      };
    }
  }
  return obj;
});

const chartDataComputed = computed(() => {
  const data = isSpread.value ? spreadDataComputed.value : chart.value;
  return (data ?? []) as TreasuryChartRowData[];
});

const spreadDataComputed = computed(() => {
  return (chart.value ?? []).map(item => ({
    'dateTime': item.dateTime,
    '2yr3mth': Number((item['2yr'] - item['3mth']).toFixed(2)),
    '10yr3mth': Number((item['10yr'] - item['3mth']).toFixed(2)),
    '10yr2yr': Number((item['10yr'] - item['2yr']).toFixed(2)),
  }));
});

const onChange = (type: string) => {
  if (Number(selectedFromYear.value) <= Number(selectedToYear.value)) return;

  const from = parseInt(selectedFromYear.value);
  const to = parseInt(selectedToYear.value);

  switch (type) {
    case 'from':
      selectedToYear.value = from.toString();
      break;
    case 'to':
      selectedFromYear.value = to.toString();
      break;
    default: break;
  }
};

const xFormatter = (index: number): string => {
  const data = chart.value;
  if (data && typeof data[index]?.dateTime === 'string') {
    return data[index].dateTime;
  }
  return '--';
};

const initYearSelector = (start = 1990) => {
  // 1990: earliest year which data is available from website
  const currentYear = new Date().getFullYear();

  for (let y = start; y <= currentYear; y++) {
    yearsList.value.push(y.toString());
  };
  yearsList.value.reverse();
};

initYearSelector();

onMounted(() => {
  refresh(); // ensures an updated chart
});
</script>
