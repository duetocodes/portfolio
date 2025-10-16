<template>
  <div class="w-fit">
    <MonthPickerRange
      v-if="props.range"
      v-bind="childProps"
      @on-select="data => modelValue = data" />
  </div>
</template>

<!--
next planned feature:

<MonthPickerMultiple
  v-else-if="props.multiple"
  v-bind="childProps" />
<MonthPickerSingle
  v-else
  v-bind="childProps" />
-->

<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date';
import type { MonthPickerTypeRange } from '~/types';

// iso friendly
const MIN_YEAR = 1;
const MAX_YEAR = 9999;

const modelValue = defineModel<MonthPickerTypeRange>({
  default: () => ({
    start: null,
    end: null,
  }),
});

const props = withDefaults(
  defineProps<{
    range?: boolean
    multiple?: boolean
    minYear?: number
    maxYear?: number
    isMonthDisabled?: (args: CalendarDate) => boolean
  }>(),
  {
    range: false,
    multiple: false,
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
    isMonthDisabled: () => false,
  },
);

const childProps = computed(() => ({
  ...props,
  modelValue: modelValue.value,
}));
</script>
