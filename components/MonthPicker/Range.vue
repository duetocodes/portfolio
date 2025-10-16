<template>
  <UCard
    :variant="props.variant"
    :ui="props.ui">
    <template #header>
      <UButton
        :disabled="counterYear <= props.minYear"
        :aria-disabled="counterYear <= props.minYear"
        :aria-label="$t('PreviousItem', { item: $t('year') })"
        color="neutral"
        variant="ghost"
        icon="material-symbols:chevron-left"
        @click="counterYear--" />

      <div class="text-center text-sm font-medium">
        {{ counterYear }}
      </div>

      <UButton
        :disabled="counterYear >= props.maxYear"
        :aria-disabled="counterYear >= props.maxYear"
        :aria-label="$t('NextItem', { item: $t('year') })"
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
        :aria-label="obj ? getMonthLabel(obj) : '--'"
        :disabled="props.isMonthDisabled(obj)"
        :aria-disabled="props.isMonthDisabled(obj)"
        :data-disabled="props.isMonthDisabled(obj) || null"
        :aria-selected="isInRange(obj)"
        :data-selected="isInRange(obj) || null"
        :data-highlighted="isWithinRangeOfHovered(obj) || null"
        :data-currentmonth="isDataCurrentMonth(obj) || null"
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
        @click="handleMonthClick(obj)">
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
  // 4 = April, 9 = September
  if (cal.month === 9 && cal.year === 2025) return true;
  if (cal.month === 4 && cal.year === 2025) return true;
  return false;
};
-->

<script setup lang="ts">
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  isSameMonth,
  isSameYear,
  parseDate,
} from '@internationalized/date';

import type { MonthPickerTypeRange } from '~/types';

const { t: $t, localeProperties } = useI18n();

const hoverMonth = ref<CalendarDate | null>(null);

const getCurrentCalendarDate = (): CalendarDate => {
  const temp = today(getLocalTimeZone());
  return new CalendarDate(temp.year, temp.month, 1);
};

const currentCalendarDate = ref<CalendarDate>(getCurrentCalendarDate());
const counterYear = ref<number>(currentCalendarDate.value.year);

const range = ref<MonthPickerTypeRange>({
  start: null,
  end: null,
});

const props = withDefaults(
  defineProps<{
    modelValue: MonthPickerTypeRange
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

onMounted(() => {
  // client-side date
  currentCalendarDate.value = getCurrentCalendarDate();
  counterYear.value = currentCalendarDate.value.year;

  if (props.modelValue && (props.modelValue.start || props.modelValue.end)) {
    // renew CalendarDate instances from v-model value
    range.value = {
      start: props.modelValue.start ? new CalendarDate(props.modelValue.start.year, props.modelValue.start.month, 1) : null,
      end: props.modelValue.end ? new CalendarDate(props.modelValue.end.year, props.modelValue.end.month, 1) : null,
    };
  }
});

const months = computed((): CalendarDate[] => {
  const arr = Array.from({ length: 12 },
    (_, i) => {
      return new CalendarDate(counterYear.value, i + 1, 1);
    },
  );
  return arr;
});

const start = computed(() => {
  if (!range.value.start) return null;

  const jsDate = range.value.start.toDate(getLocalTimeZone());

  return {
    shortName: jsDate.toLocaleString(localeProperties.value.dateLocale as string, { month: 'short' }),
    timestamp: jsDate.getTime(),
    // ensures exact type, because CalendarDate has private properties that get lost when .i.e, emitting
    // and thus may trigger type errors in parent component .i.e, v-model
    calendarDate: range.value.start.copy(),
  };
});

const end = computed(() => {
  if (!range.value.end) return null;

  const jsDate = range.value.end.toDate(getLocalTimeZone());

  return {
    shortName: jsDate.toLocaleString(localeProperties.value.dateLocale as string, { month: 'short' }),
    timestamp: jsDate.getTime(),
    calendarDate: range.value.end.copy(),
    // calendarDate: new CalendarDate(range.value.end.year, range.value.end.month, 1),
  };
});

const selectionLabel = computed((): string => {
  const labelStart = start.value ? `${start.value.shortName} ${start.value.calendarDate.year}` : $t('From');
  const labelEnd = end.value ? `${end.value.shortName} ${end.value.calendarDate.year}` : $t('To');
  return `${labelStart} - ${labelEnd}`;
});

const getMonthLabel = (mth: CalendarDate) => {
  const jsDate = mth.toDate(getLocalTimeZone());
  return jsDate.toLocaleString(localeProperties.value.dateLocale as string, { month: 'short' });
};

const isDataCurrentMonth = (mth: CalendarDate) => {
  const parsed = parseDate(currentCalendarDate.value.toString());
  return isSameMonth(mth, parsed) && isSameYear(mth, parsed);
};

const hasDisabledMonthWithinRange = (a: CalendarDate, b: CalendarDate): boolean => {
  if (!a || !b) return false;

  const isForward = a.compare(b) <= 0;
  let current = a.copy();
  const end = b.copy();

  // iterate months in correct direction
  while (true) {
    if (props.isMonthDisabled(current)) return true; // early exit

    if (current.year === end.year && current.month === end.month) break;

    current = isForward
      ? current.add({ months: 1 })
      : current.subtract({ months: 1 });
  }

  return false;
};

const handleMonthClick = (selected: CalendarDate) => {
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
    if (start.value && end.value) {
      if (hasDisabledMonthWithinRange(start.value.calendarDate, end.value.calendarDate)) {
        range.value.start = selected;
        range.value.end = null;
      }
    }
  }

  if (start.value && end.value) {
    const renewed = {
      start: start.value.calendarDate,
      end: end.value.calendarDate,
    };
    emits('on-select', renewed); // always emit with new instances
  }
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
    // const newHover = new CalendarDate(hovered.year, hovered.month, 1); // renew instance
    const newHover = hovered.copy(); // renew instance
    if (hasDisabledMonthWithinRange(start.value.calendarDate, newHover))
      return false;

    const hoveredTimestamp = hovered.toDate(getLocalTimeZone()).getTime();
    const hoverMonthTimestamp = hoverMonth.value.toDate(getLocalTimeZone()).getTime();

    const min = Math.min(start.value.timestamp, hoverMonthTimestamp);
    const max = Math.max(start.value.timestamp, hoverMonthTimestamp);

    return !props.isMonthDisabled(hovered) && (hoveredTimestamp >= min && hoveredTimestamp <= max);
  }
};

const onHoverMonth = (hovered: CalendarDate) => {
  if (start.value && !end.value) {
    // hoverMonth.value = new CalendarDate(hovered.year, hovered.month, 1); // renew instance
    hoverMonth.value = hovered.copy(); // renew instance
  }
};
</script>
