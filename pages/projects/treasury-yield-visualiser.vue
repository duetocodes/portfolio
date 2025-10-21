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
        separator-icon="material-symbols:chevron-right"
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
            icon="material-symbols:check-small"
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
            icon="material-symbols:check-small"
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
          <div>
            <UPopover
              :ui="{ content: 'overflow-clip ring-0' }"
              :content="{ align: 'end' }"
              @update:open="onUpdateOpen">
              <UButton
                :label="pickerLabel"
                :aria-label="$t('SelectItem', { item: tabIndex == '0' ? $t('year') : $t('month') })"
                :loading="statusChart === 'pending'"
                color="neutral"
                variant="outline"
                size="lg"
                icon="material-symbols:date-range"
                loading-icon="material-symbols:app-badging-outline" />

              <template #content>
                <UTabs
                  v-model="tabIndex"
                  class="p-2"
                  :items="tabItems">
                  <template #year>
                    <YearPicker
                      v-model="picker"
                      range
                      :is-year-disabled="disabledYears" />
                  </template>

                  <template #month>
                    <MonthPicker
                      v-model="picker"
                      range
                      :is-month-disabled="disabledMonths" />
                  </template>
                </UTabs>
              </template>
            </UPopover>
          </div>
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
import type { BreadcrumbItem, TabsItem } from '@nuxt/ui';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';

const { t: $t, locale, localeProperties } = useI18n();
const nuxtApp = useNuxtApp();
const route = useRoute();
const localePath = useLocalePath();

const EARLIEST_RECORD = {
  year: 1990,
  month: 1,
  day: 2,
};

const isSpread = ref(false);
const termCheckboxes = ref(['3mth', '2yr', '10yr']);
const spreadCheckboxes = ref(['2yr3mth', '10yr3mth', '10yr2yr']);

const date = new Date();
const currentDate = ref(new CalendarDate(
  date.getUTCFullYear(),
  date.getUTCMonth() + 1, // adheres to CalendarDate format .i.e, Jan=1
  date.getUTCDate()),
);

const picker = shallowRef({
  start: currentDate.value.copy(),
  end: currentDate.value.copy(),
});

const tabIndex = ref('0'); // default to 'Year', string by default
const tabItems = computed<TabsItem[]>(() => [
  {
    label: $t('Year'),
    slot: 'year',
  },
  {
    label: $t('Month'),
    slot: 'month',
  },
]);
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
    method: 'POST',
    key: locale,
    watch: false,
    onRequest({ options }) {
      // client-side
      if (picker.value.start && picker.value.end) {
        options.body = {
          searchBy: Number(tabIndex.value),
          from: {
            year: picker.value.start.year,
            month: picker.value.start.month,
            day: picker.value.start.day,
          },
          to: {
            year: picker.value.end.year,
            month: picker.value.end.month,
            day: picker.value.end.day,
          },
        };
      }
    },
    onResponse({ response }) {
      // client-side
      if (Array.isArray(response._data)) {
        response._data = response._data.map((item) => {
          return {
            ...item,
            date: getLocalisedDate(item.date),
          };
        });
      }
    },
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

useHead({
  link: [{
    rel: 'canonical',
    href: `https://duetocodes.com${route.fullPath}`,
  }],
});

useSeoMeta({
  title: () => `${$t('TreasuryYieldVisualiser')} - ${$t('Projects')} | duetocodes`,
  description: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogSiteName: () => `${$t('TreasuryYieldVisualiser')} - ${$t('Projects')} | duetocodes`,
  ogTitle: () => `${$t('TreasuryYieldVisualiser')} - ${$t('Projects')} | duetocodes`,
  ogDescription: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogImage: () => ({
    url: overview.value?.data?.[0].preview?.image?.url,
    alt: overview.value?.data?.[0].preview?.image?.alternativeText,
    width: overview.value?.data?.[0].preview?.image?.width,
    height: overview.value?.data?.[0].preview?.image?.height,
    type: overview.value?.data?.[0].preview?.image?.mime,
  }),
  ogUrl: () => `https://duetocodes.com${route.fullPath}`,
  ogType: 'website',
  twitterTitle: () => `${$t('TreasuryYieldVisualiser')} - ${$t('Projects')} | duetocodes`,
  twitterDescription: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
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
    'date': item.date,
    '2yr3mth': Number((item['2yr'] - item['3mth']).toFixed(2)),
    '10yr3mth': Number((item['10yr'] - item['3mth']).toFixed(2)),
    '10yr2yr': Number((item['10yr'] - item['2yr']).toFixed(2)),
  }));
});

const pickerLabel = computed((): string => {
  let from = '';
  let to = '';

  switch (tabIndex.value) {
    case '0': {
      from = picker.value.start ? picker.value.start.year.toString() : '';
      to = picker.value.end ? picker.value.end.year.toString() : '';
      break;
    }
    case '1': {
      const dateLocale = localeProperties.value.dateLocale as string;

      if (picker.value.start) {
        const jsDateStart = picker.value.start.toDate(getLocalTimeZone());
        const mmm = jsDateStart.toLocaleString(dateLocale, { month: 'short' });
        from = `${mmm} ${picker.value.start.year}`;
      }
      if (picker.value.end) {
        const jsDateEnd = picker.value.end.toDate(getLocalTimeZone());
        const mmm = jsDateEnd.toLocaleString(dateLocale, { month: 'short' });
        to = `${mmm} ${picker.value.end.year}`;
      }
      break;
    }
    default: break;
  }

  return `${from || $t('Start')} - ${to || $t('End')}`;
});

const disabledYears = (cal: CalendarDate) => {
  if (cal.year < EARLIEST_RECORD.year || cal.year > currentDate.value.year) return true;
  return false;
};
const disabledMonths = (cal: CalendarDate) => {
  if (cal.year < EARLIEST_RECORD.year || cal.year > currentDate.value.year) return true;
  if (cal.year === currentDate.value.year && cal.month > currentDate.value.month) return true;
  return false;
};

const onUpdateOpen = (isOpen: boolean) => {
  // fetch on close popover
  if (!isOpen && picker.value.start && picker.value.end)
    refresh();
};

const xFormatter = (index: number): string => {
  const data = toRaw(chart.value);

  if (data && typeof data[index]?.date === 'string') {
    return data[index].date;
  }
  return '--';
};

const getLocalisedDate = (iso: string) => new Date(iso).toLocaleDateString((localeProperties.value.dateLocale || 'en-GB') as string, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

onMounted(() => {
  refresh(); // ensures an updated chart on page land
});
</script>
