<template>
  <UCard
    variant="subtle"
    :ui="{
      header: 'flex justify-between items-center p-2 sm:px-2',
      body: 'p-2 sm:p-2',
      footer: 'p-2 sm:px-2',
    }">
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
        v-for="year in displayed"
        :key="year"
        :label="year ? year.toString() : '--'"
        :aria-disabled="isYearDisabled(year)"
        :aria-selected="isInRange(year)"
        :data-disabled="isYearDisabled(year) || null"
        :data-selected="isInRange(year) || null"
        :data-highlighted="isWithinRangeOfHovered(year) || null"
        :data-currentyear="year === new Date().getFullYear() || null"
        color="neutral"
        variant="ghost"
        class="w-[4rem] rounded-full block
            data-selected:bg-primary data-selected:text-inverted
            data-disabled:text-dimmed/50
            data-currentyear:font-bold data-currentyear:not-data-selected:text-primary
            hover:not-data-selected:bg-primary/20"
        :class="[
          { 'data-highlighted:bg-primary/20': isWithinRangeOfHovered(year) },
        ]"
        @mouseenter="onHoverYear(year)"
        @mouseleave="hoverYear = NaN"
        @click="handleYearClick(year)">
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PickerTypeRange } from '~/types';

const { t: $t } = useI18n();

const CURRENT_YEAR = new Date().getFullYear();

const counter = ref(0);
const currentYear = ref(CURRENT_YEAR);
const hoverYear = ref<number>(NaN);

const range = ref<PickerTypeRange>({
  start: CURRENT_YEAR,
  end: CURRENT_YEAR,
});

const label = computed(() => {
  const yearStart = displayed.value[0]?.toString();
  const yearEnd = displayed.value[displayed.value?.length - 1]?.toString();

  if (yearStart && yearEnd) {
    return `${yearStart} - ${yearEnd}`;
  }
  else return $t('SelectItem', { item: $t('year') });
});

const props = withDefaults(
  defineProps<{
    val: number | PickerTypeRange
    minYear?: number
    maxYear?: number
    yearsPerPage?: number
    rangeStart: number
    rangeEnd: number
    isYearDisabled?: (args: number) => boolean
  }>(),
  {
    minYear: NaN,
    maxYear: NaN,
    yearsPerPage: 12,
    isYearDisabled: () => false,
  },
);

const emits = defineEmits<{
  (e: 'on-select', value: PickerTypeRange): void
}>();

const displayed = computed(() => {
  const arr = Array.from(
    { length: props.yearsPerPage },
    (_, i) => {
      const val = i + currentYear.value + (props.yearsPerPage * counter.value) - (props.yearsPerPage - 1);
      if (val < props.rangeStart || val > props.rangeEnd)
        return NaN;
      else
        return val;
    },
  );
  return arr ?? [];
});

const handleYearClick = (year: number) => {
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
  if (range.value.start && !range.value.end) {
    hoverYear.value = year;
  }
};

onMounted(() => {
  range.value = toRaw(props.val) as PickerTypeRange;
});
</script>
