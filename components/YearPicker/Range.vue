<template>
  <UCard
    :variant="props.variant"
    :ui="props.ui">
    <template #header>
      <UButton
        :disabled="currentCalendarDate.year <= props.minYear"
        :aria-disabled="currentCalendarDate.year <= props.minYear"
        :aria-label="$t('PreviousItem', { item: $t('year') })"
        color="neutral"
        variant="ghost"
        icon="material-symbols:chevron-left"
        @click="counter--" />

      <div class="text-center text-sm font-medium">
        {{ label }}
      </div>

      <UButton
        :disabled="currentCalendarDate.year >= props.maxYear"
        :aria-disabled="currentCalendarDate.year >= props.maxYear"
        :aria-label="$t('NextItem', { item: $t('year') })"
        color="neutral"
        variant="ghost"
        icon="material-symbols:chevron-right"
        @click="counter++" />
    </template>

    <div class="grid grid-cols-3 gap-1.5">
      <UButton
        v-for="(cal, ind) in years"
        :key="`${cal}-${ind}`"
        :label="cal ? cal.year.toString() : '--'"
        :aria-label="cal ? cal.toString() : '--'"
        :disabled="props.isYearDisabled(cal)"
        :aria-disabled="props.isYearDisabled(cal)"
        :data-disabled="props.isYearDisabled(cal) || null"
        :aria-selected="isInRange(cal)"
        :data-selected="isInRange(cal) || null"
        :data-highlighted="isWithinRangeOfHovered(cal) || null"
        :data-currentCalendarDate="isSameYear(cal, currentCalendarDate.copy()) || null"
        color="neutral"
        variant="ghost"
        class="w-[4rem] rounded-full block
            data-selected:bg-primary data-selected:text-inverted
            data-disabled:text-dimmed/50
            data-currentCalendarDate:font-bold data-currentCalendarDate:not-data-selected:text-primary
            data-highlighted:bg-primary/20
            hover:not-data-selected:bg-primary/20"
        @mouseenter="onHoverYear(cal)"
        @mouseleave="hoverYear = null"
        @click="handleYearClick(cal)">
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

const disabledYear = (cal: CalendarDate) => {
  if (cal.year === 2022) return true;
  if (cal.year <= 1990) return true;
  return false;
};
-->

<script setup lang="ts">
import type { PickerTypeRange } from '~/types';
import {
  CalendarDate,
  isSameYear,
  today,
  getLocalTimeZone,
} from '@internationalized/date';

const { t: $t } = useI18n();
const { TEXTS } = useNonReactiveTranslation();

const counter = ref(0);

const getCurrentCalendarDate = () => today(getLocalTimeZone());

const currentCalendarDate = ref<CalendarDate>(getCurrentCalendarDate());
const hoverYear = ref<CalendarDate | null>(null);

const range = ref<PickerTypeRange>({
  start: null,
  end: null,
});

const label = computed(() => {
  const yearStart = years.value[0]?.year.toString();
  const yearEnd = years.value[years.value?.length - 1]?.year.toString();

  if (yearStart && yearEnd) {
    return `${yearStart} - ${yearEnd}`;
  }
  else return $t('SelectItem', { item: $t('year') });
});

const props = defineProps<{
  modelValue: PickerTypeRange
  yearsPerPage: number
  minYear: number
  maxYear: number
  hasLabel: boolean
  isYearDisabled: (args: CalendarDate) => boolean
  variant: 'subtle' | 'outline' | 'solid' | 'soft'
  ui: {
    root?: string
    header?: string
    body?: string
    footer?: string
  }
}>();

const emits = defineEmits<{
  (e: 'on-select', value: PickerTypeRange): void
}>();

onMounted(() => {
  // client-side date
  currentCalendarDate.value = getCurrentCalendarDate();

  if (props.modelValue && (props.modelValue.start || props.modelValue.end)) {
    // renew CalendarDate instances from v-model value
    range.value = {
      start: props.modelValue.start ? new CalendarDate(props.modelValue.start.year, 1, 1) : null,
      end: props.modelValue.end ? new CalendarDate(props.modelValue.end.year, 1, 1) : null,
    };
  }
  // show landing decade based on start year
  if (props.modelValue.start) {
    const startYear = props.modelValue.start.year;
    const currentYear = new Date().getFullYear();
    const currentDecadeStart = Math.floor(currentYear / 10) * 10;
    const targetDecadeStart = Math.floor(startYear / 10) * 10;
    counter.value = (targetDecadeStart - currentDecadeStart) / 10;
  }
});

const years = computed((): CalendarDate[] => {
  const pageSize = props.yearsPerPage;
  const currentYear = currentCalendarDate.value.year;

  // Snap to decade start (1990, 2000, 2010, ...)
  const decadeStart = Math.floor(currentYear / 10) * 10;

  // Move by page offset (each page = one decade)
  const startYear = decadeStart + counter.value * 10;

  const arr = Array.from({ length: pageSize }, (_, i) => {
    const yr = startYear + i;
    if (yr < props.minYear || yr > props.maxYear) return null;
    return new CalendarDate(yr, 1, 1);
  });

  return arr.filter(item => item !== null);
});

const selectionLabel = computed((): string => {
  const from = range.value.start?.year || TEXTS.Start;
  const to = range.value.end?.year || TEXTS.End;
  return `${from} - ${to}`;
});

const hasDisabledYearWithinRange = (a: CalendarDate, b: CalendarDate): boolean => {
  if (typeof a.year !== 'number' || typeof b.year !== 'number') return false;

  const isForward = a.year <= b.year;
  let marker = a.copy();

  while (true) {
    if (props.isYearDisabled(marker)) return true;
    if (isSameYear(marker, b)) break;
    marker = isForward ? marker.add({ years: 1 }) : marker.subtract({ years: 1 });
  }

  return false;
};

const handleYearClick = (cal: CalendarDate) => {
  if (!range.value.start || (range.value.start && range.value.end)) {
    range.value.start = cal.copy();
    range.value.end = null;
  }
  else {
    if (cal && cal.year >= range.value.start.year) {
      range.value.end = cal.copy();
    }
    else {
      range.value.end = range.value.start;
      range.value.start = cal.copy();
    }

    // updated start & end
    if (range.value.start && range.value.end) {
      if (hasDisabledYearWithinRange(range.value.start.copy(), range.value.end.copy())) {
        range.value.start = cal.copy();
        range.value.end = null;
      }
    }
  }

  const renewedInstance = {
    start: range.value.start ? range.value.start.copy() : null,
    end: range.value.end ? range.value.end.copy() : null,
  };
  emits('on-select', renewedInstance);
};

const isInRange = (cal: CalendarDate) => {
  if (!range.value.start) return false;

  if (range.value.start && range.value.end && cal.year) {
    return cal.year >= range.value.start.year && cal.year <= range.value.end.year;
  }

  return cal.year === range.value.start.year;
};

const isWithinRangeOfHovered = (cal: CalendarDate) => {
  if (range.value.start && !range.value.end && hoverYear.value && cal.year) {
    if (hasDisabledYearWithinRange(range.value.start.copy(), hoverYear.value.copy()))
      return false;

    const min = Math.min(range.value.start.year, hoverYear.value.year);
    const max = Math.max(range.value.start.year, hoverYear.value.year);
    return cal.year >= min && cal.year <= max;
  }
};

const onHoverYear = (cal: CalendarDate) => {
  if (range.value.start && !range.value.end) {
    hoverYear.value = cal.copy();
  }
};
</script>
