<template>
  <div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 mb-4">
    <UButton
      v-for="year in props.displayedYears"
      :key="year"
      :label="year?.toString() ?? '--'"
      :disabled="isYearDisabled(year)"
      :aria-disabled="isYearDisabled(year)"
      :aria-selected="isInRange(year)"
      :data-disabled="isYearDisabled(year) || null"
      :data-selected="isInRange(year) || null"
      :data-highlighted="isWithinRangeOfHovered(year) ?? null"
      :data-current-year="year === new Date().getFullYear()"
      color="neutral"
      variant="ghost"
      class="w-[4rem] rounded-full block
        data-disabled:text-muted
        data-[current-year]:font-semibold data-[current-year]:not-data-[selected]:text-primary
        hover:not-data-[selected]:bg-primary/20"
      :class="[isInRange(year) ? 'data-selected:bg-primary data-selected:text-inverted' : 'data-[highlighted]:bg-primary/20']"
      @mouseenter="onHoverYear(year)"
      @mouseleave="hoverYear = NaN"
      @click="handleYearClick(year)" />
  </div>
</template>

<script setup lang="ts">
import type { YearPickerTypeRange } from '~/types';

const hoverYear = ref<number>(NaN);
const range = ref<YearPickerTypeRange>({
  start: NaN,
  end: NaN,
});

const props = withDefaults(
  defineProps<{
    val: number | YearPickerTypeRange
    minYear?: number
    maxYear?: number
    yearsPerPage?: number
    rangeStart?: number
    rangeEnd?: number
    displayedYears: number[]
  }>(),
  {
    minYear: NaN,
    maxYear: NaN,
    yearsPerPage: 12,
    rangeStart: 1900,
    rangeEnd: 2200,
  },
);

const emits = defineEmits<{
  (e: 'on-select', value: YearPickerTypeRange): void
}>();

const isYearDisabled = (year: number) => {
  if (!isNaN(props.minYear) && year < props.minYear) return true;
  if (!isNaN(props.maxYear) && year > props.maxYear) return true;
  return false;
};

const handleYearClick = (year: number) => {
  if (isYearDisabled(year)) return;

  if (!range.value.start || (range.value.start && range.value.end)) {
    range.value.start = year;
    range.value.end = NaN;
  }
  else {
    if (year >= range.value.start) {
      range.value.end = year;
    }
    else {
      range.value.end = range.value.start;
      range.value.start = year;
    }
  }

  emits('on-select', toRaw(range.value));
};

const isInRange = (year: number) => {
  if (!range.value.start) return false;

  if (range.value.start && range.value.end) {
    return year >= range.value.start && year <= range.value.end;
  }

  return year === range.value.start;
};

const isWithinRangeOfHovered = (year: number) => {
  if (range.value.start && !range.value.end && hoverYear.value) {
    const min = Math.min(range.value.start, hoverYear.value);
    const max = Math.max(range.value.start, hoverYear.value);
    return year >= min && year <= max;
  }
};

const onHoverYear = (year: number) => {
  if (isYearDisabled(year)) return;
  if (range.value.start && !range.value.end) {
    hoverYear.value = year;
  }
};

onMounted(() => {
  range.value = toRaw(props.val) as YearPickerTypeRange;
});
</script>
