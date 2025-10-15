<template>
  <div>
    <UPopover
      :ui="{ content: 'overflow-clip' }"
      @update:open="onUpdateOpen">
      <UButton
        :label="yearPickerLabel"
        color="neutral"
        variant="outline" />

      <template #content>
        <YearPicker
          v-model="yearPicker"
          range
          :is-year-disabled="disabledYear" />
      </template>
    </UPopover>

    <div>
      <YearPicker
        v-model="range2"
        range
        :is-year-disabled="disabledYear" />
    </div>

    <!-- <div>
      <MonthPicker
        v-model="monthRange"
        range
        :is-month-disabled="disabledMonth" />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import type { YearPickerTypeRange } from '~/types';
import type { CalendarDate } from '@internationalized/date';

const { t: $t } = useI18n();

const yearPicker = ref<YearPickerTypeRange>({
  start: null,
  end: null,
});
const range2 = ref<YearPickerTypeRange>({
  start: NaN,
  end: NaN,
});

const yearPickerLabel = computed((): string => {
  const from = yearPicker.value.start || $t('Start');
  const to = yearPicker.value.end || $t('End');
  return `${from} - ${to}`;
});
let previous: YearPickerTypeRange = { start: null, end: null };
const onUpdateOpen = (isOpen: boolean) => {
  if (isOpen)
    previous = structuredClone(toRaw(yearPicker.value));
  else {
    const curr = structuredClone(toRaw(yearPicker.value));
    if (curr.start === previous.start && curr.end === previous.end)
      return;
    else if (curr.start && curr.end) {
      // default fetch with different start and end
    }
    else {
      // do fetch with start === end
    }
  }
};

const disabledYear = (year: number | null) => {
  if (year === null) return false;
  if (year < 1990 || year > new Date().getFullYear()) return true;
  if (year === 2020) return true;
  return false;
};

// month picker
const monthRange = ref();
const disabledMonth = (cal: CalendarDate) => {
  if (cal.month === 9 && cal.year === 2025) return true;
  if (cal.month === 4 && cal.year === 2025) return true;
  return false;
};
</script>
