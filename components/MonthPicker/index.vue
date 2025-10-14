<template>
  <div class="w-fit">
    <MonthPickerRange
      v-if="props.range"
      v-bind="childProps"
      @on-select="data => model = data" />
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

const model = defineModel<MonthPickerTypeRange | null>({ default: null });

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
  val: model.value,
}));
</script>
