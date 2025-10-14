<template>
  <UCard
    :variant="props.variant"
    :ui="props.ui">
    <template #header>
      <UButton
        :disabled="counterYear <= props.minYear"
        color="neutral"
        variant="ghost"
        icon="material-symbols:chevron-left"
        @click="counterYear--" />

      <div class="text-center text-sm font-medium">
        {{ counterYear }}
      </div>

      <UButton
        :disabled="counterYear >= props.maxYear"
        color="neutral"
        variant="ghost"
        icon="material-symbols:chevron-right"
        @click="counterYear++" />
    </template>

    <div class="grid grid-cols-3 gap-1.5">
      <UButton
        v-for="obj in months"
        :key="`${obj.year}-${obj.month}`"
        :label="obj ? getMonthLabel(obj) : '--'"
        :disabled="props.isMonthDisabled(obj)"
        :aria-disabled="props.isMonthDisabled(obj)"
        :data-disabled="props.isMonthDisabled(obj) || null"
        :aria-selected="isInRange(obj)"
        :data-selected="isInRange(obj) || null"
        :data-highlighted="isWithinRangeOfHovered(obj) || null"
        :data-currentmonth="(isSameMonth(obj, CURRENT) && isSameYear(obj, CURRENT)) || null"
        color="neutral"
        variant="ghost"
        class="w-[4rem] rounded-full block
          data-selected:bg-primary data-selected:text-inverted
          data-disabled:text-dimmed/50
          data-currentmonth:font-bold data-currentmonth:not-data-selected:text-primary
          data-highlighted:bg-primary/20
          hover:not-data-selected:bg-primary/20"
        @mouseenter="onHoverMonth(obj)"
        @mouseleave="hoverMonth = null"
        @click="handleYearClick(obj)">
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
disabling month (parent):

<MonthPicker
  v-model="monthRange"
  range
  :is-month-disabled="disabledMonth" />

const disabledMonth = (cal: CalendarDate) => {
  if (cal.month === 9 && cal.year === 2025) return true;
  if (cal.month === 4 && cal.year === 2025) return true;
  return false;
};
-->

<script setup lang="ts">
import { CalendarDate, today, getLocalTimeZone, isSameMonth, isSameYear } from '@internationalized/date';
import type { MonthPickerTypeRange } from '~/types';

const { t: $t } = useI18n();

const hoverMonth = ref<CalendarDate | null>(null);
const getCurrentCalendarDate = () => today(getLocalTimeZone());

const CURRENT = getCurrentCalendarDate();
const counterYear = ref(CURRENT.year);

const range = ref<MonthPickerTypeRange>({
  start: null,
  end: null,
});

const props = withDefaults(
  defineProps<{
    val: MonthPickerTypeRange | null
    minYear: number
    maxYear: number
    hasLabel?: boolean
    variant?: 'subtle' | 'outline' | 'solid' | 'soft'
    isMonthDisabled?: (args: CalendarDate) => boolean
    ui?: {
      root?: string
      header?: string
      body?: string
      footer?: string
    }
  }>(),
  {
    hasLabel: false,
    variant: 'subtle',
    isMonthDisabled: () => false,
    ui: () => ({
      header: 'flex justify-between items-center p-2 sm:px-2',
      body: 'p-2 sm:p-2',
      footer: 'p-2 sm:px-2',
    }),
  },
);

const emits = defineEmits<{
  (e: 'on-select', value: MonthPickerTypeRange): void
}>();

const months = computed((): CalendarDate[] => {
  const arr = Array.from({ length: 12 },
    (_, i) => {
      return new CalendarDate(counterYear.value, i + 1, 1);
    },
  );
  return arr;
});

const getMonthLabel = (mth: CalendarDate) => {
  const jsDate = mth.toDate(getLocalTimeZone());
  return jsDate.toLocaleString('default', { month: 'short' });
};

const start = computed(() => {
  if (!range.value.start) return null;

  const jsDate = range.value.start.toDate(getLocalTimeZone());

  return {
    shortName: jsDate.toLocaleString('default', { month: 'short' }),
    // yyyymmdd: range.value.start.toString(),
    timestamp: jsDate.getTime(),
    calendarDate: range.value.start,
  };
});

const end = computed(() => {
  if (!range.value.end) return null;

  const jsDate = range.value.end.toDate(getLocalTimeZone());

  return {
    shortName: jsDate.toLocaleString('default', { month: 'short' }),
    // yyyymmdd: range.value.end.toString(),
    timestamp: jsDate.getTime(),
    calendarDate: range.value.end,
  };
});

const selectionLabel = computed((): string => {
  let labelStart, labelEnd;
  if (start.value)
    labelStart = `${start.value.shortName} ${start.value.calendarDate.year}`;
  else
    labelStart = $t('From');

  if (end.value)
    labelEnd = `${end.value.shortName} ${end.value.calendarDate.year}`;
  else
    labelEnd = $t('To');

  return `${labelStart} - ${labelEnd}`;
});

const hasDisabledMonthWithinRange = (a: CalendarDate, b: CalendarDate): boolean => {
  if (!a || !b) return false;

  const filtered = months.value.filter((obj) => {
    if (b.month > a.month)
      return obj.month >= a.month && obj.month <= b.month;
    else
      return obj.month >= b.month && obj.month <= a.month;
  });

  return filtered.some(obj => props.isMonthDisabled(obj));
};

const handleYearClick = (selected: CalendarDate) => {
  const selectedTimestamp = selected.toDate(getLocalTimeZone()).getTime();

  if ((!start.value || (start.value && end.value))) {
    range.value.start = selected;
    range.value.end = null;
  }
  else {
    if (selectedTimestamp >= start.value.timestamp) {
      range.value.end = selected;
    }
    else {
      range.value.end = start.value.calendarDate;
      range.value.start = selected;
    }

    // updated start & end
    if (range.value.start && range.value.end) {
      if (hasDisabledMonthWithinRange(range.value.start as CalendarDate, range.value.end as CalendarDate)) {
        range.value.start = selected;
        range.value.end = null;
      }
    }
  }

  emits('on-select', range.value as MonthPickerTypeRange);
};

const isInRange = (selected: CalendarDate) => {
  const selectedTimestamp = selected.toDate(getLocalTimeZone()).getTime();

  if (!start.value) return false;

  if (start.value && end.value) {
    return selectedTimestamp >= start.value.timestamp && selectedTimestamp <= end.value.timestamp;
  }

  return selectedTimestamp === start.value.timestamp;
};

const isWithinRangeOfHovered = (hovered: CalendarDate) => {
  if (start.value && !end.value && hoverMonth.value) {
    if (hasDisabledMonthWithinRange(start.value.calendarDate as CalendarDate, hoverMonth.value as CalendarDate))
      return false;

    const hoveredTimestamp = hovered.toDate(getLocalTimeZone()).getTime();
    const hoverMonthTimestamp = hoverMonth.value.toDate(getLocalTimeZone()).getTime();

    const min = Math.min(start.value.timestamp, hoverMonthTimestamp);
    const max = Math.max(start.value.timestamp, hoverMonthTimestamp);

    return !props.isMonthDisabled(hovered) && (hoveredTimestamp >= min && hoveredTimestamp <= max);
  }
};

const onHoverMonth = (hovered: CalendarDate) => {
  if (range.value.start && !range.value.end) {
    hoverMonth.value = hovered;
  }
};
</script>
