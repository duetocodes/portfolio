<template>
  <UCard
    :variant="props.variant"
    :ui="props.ui">
    <template #header>
      <UButton
        :disabled="false"
        color="neutral"
        variant="ghost"
        icon="material-symbols:chevron-left"
        @click="counter--" />

      <div class="text-center text-sm font-medium">
        {{ label }}
      </div>

      <UButton
        :disabled="false"
        color="neutral"
        variant="ghost"
        icon="material-symbols:chevron-right"
        @click="counter++" />
    </template>

    <div class="grid grid-cols-3 md:grid-cols-4 gap-1.5">
      <UButton
        v-for="(year, ind) in years"
        :key="`${year}-${ind}`"
        :label="year ? year.toString() : '--'"
        :disabled="props.isYearDisabled(year)"
        :aria-disabled="props.isYearDisabled(year)"
        :data-disabled="props.isYearDisabled(year) || null"
        :aria-selected="isInRange(year)"
        :data-selected="isInRange(year) || null"
        :data-highlighted="isWithinRangeOfHovered(year) || null"
        :data-currentyear="year === currentYear || null"
        color="neutral"
        variant="ghost"
        class="w-[4rem] rounded-full block
            data-selected:bg-primary data-selected:text-inverted
            data-disabled:text-dimmed/50
            data-currentyear:font-bold data-currentyear:not-data-selected:text-primary
            data-highlighted:bg-primary/20
            hover:not-data-selected:bg-primary/20"
        @mouseenter="onHoverYear(year)"
        @mouseleave="hoverYear = null"
        @click="handleYearClick(year)">
      </UButton>
    </div>

    <template
      v-if="props.hasLabel"
      #footer>
      <p class="text-sm text-center text-muted">
        {{ selectionLabel }}
      </p>
    </template>
  </UCard>
</template>

<!--
disabling years (parent):
<YearPicker
  v-model="range"
  range
  :is-year-disabled="disabledYear" />

const disabledYear = (year: number) => {
  if (year < 1990 || year > new Date().getFullYear()) return true;
  if (year === 2020) return true;
  return false;
};
-->

<script setup lang="ts">
import type { YearPickerTypeRange } from '~/types';

const { t: $t } = useI18n();

const counter = ref(0);
const currentYear = ref(new Date().getFullYear());
const hoverYear = ref<number | null>(null);

const range = ref<YearPickerTypeRange>({
  start: null,
  end: null,
});

// iso compliant
const MIN_YEAR = 1;
const MAX_YEAR = 9999;

const label = computed(() => {
  const yearStart = years.value[0]?.toString();
  const yearEnd = years.value[years.value?.length - 1]?.toString();

  if (yearStart && yearEnd) {
    return `${yearStart} - ${yearEnd}`;
  }
  else return $t('SelectItem', { item: $t('year') });
});

const props = withDefaults(
  defineProps<{
    val: YearPickerTypeRange
    minYear?: number
    maxYear?: number
    yearsPerPage?: number
    hasLabel?: boolean
    isYearDisabled?: (args: number | null) => boolean
    variant?: 'subtle' | 'outline' | 'solid' | 'soft'
    ui?: {
      root?: string
      header?: string
      body?: string
      footer?: string
    }
  }>(),
  {
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
    yearsPerPage: 16,
    hasLabel: false,
    isYearDisabled: () => false,
    variant: 'subtle',
    ui: () => ({
      header: 'flex justify-between items-center p-2 sm:px-2',
      body: 'p-2 sm:p-2',
      footer: 'p-2 sm:px-2',
    }),
  },
);

const emits = defineEmits<{
  (e: 'on-select', value: YearPickerTypeRange): void
}>();

onMounted(() => {
  // client-side date
  currentYear.value = new Date().getFullYear();
  range.value = toRaw(props.val);
});

const years = computed(() => {
  const arr = Array.from(
    { length: props.yearsPerPage },
    (_, i) => {
      const val = i + currentYear.value + (props.yearsPerPage * counter.value) - (props.yearsPerPage - 1);
      if (val < props.minYear || val > props.maxYear)
        return null;
      else
        return val;
    },
  );
  return arr ?? [];
});

const selectionLabel = computed((): string => {
  const from = range.value.start || $t('Start');
  const to = range.value.end || $t('End');
  return `${from} - ${to}`;
});

const hasDisabledYearWithinRange = (a: number, b: number): boolean => {
  if (!a || !b) return false;

  const filtered = years.value.filter((year) => {
    if (b > a)
      return year && (year >= a && year <= b);
    else
      return year && (year >= b && year <= a);
  });

  return filtered.some(year => props.isYearDisabled(year));
};

const handleYearClick = (year: number | null) => {
  if (!range.value.start || (range.value.start && range.value.end)) {
    range.value.start = year;
    range.value.end = null;
  }
  else {
    if (year && year >= range.value.start) {
      range.value.end = year;
    }
    else {
      range.value.end = range.value.start;
      range.value.start = year;
    }

    // updated start & end
    if (range.value.start && range.value.end) {
      if (hasDisabledYearWithinRange(range.value.start, range.value.end)) {
        range.value.start = year;
        range.value.end = null;
      }
    }
  }

  if (range.value.start && range.value.end)
    emits('on-select', toRaw(range.value));
};

const isInRange = (year: number | null) => {
  if (!range.value.start) return false;

  if (range.value.start && range.value.end && year) {
    return year >= range.value.start && year <= range.value.end;
  }

  return year === range.value.start;
};

const isWithinRangeOfHovered = (year: number | null) => {
  if (range.value.start && !range.value.end && hoverYear.value && year) {
    if (hasDisabledYearWithinRange(range.value.start, hoverYear.value))
      return false;

    const min = Math.min(range.value.start, hoverYear.value);
    const max = Math.max(range.value.start, hoverYear.value);
    return year >= min && year <= max;
  }
};

const onHoverYear = (year: number | null) => {
  if (range.value.start && !range.value.end) {
    hoverYear.value = year;
  }
};
</script>
