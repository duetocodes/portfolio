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
import type { PickerTypeRange } from '~/types';

// iso friendly
const MIN_YEAR = 1;
const MAX_YEAR = 9999;

const modelValue = defineModel<PickerTypeRange>({
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
    variant?: 'subtle' | 'outline' | 'solid' | 'soft'
    ui?: {
      root?: string
      header?: string
      body?: string
      footer?: string
    }

    hasLabel?: boolean
  }>(),
  {
    range: false,
    multiple: false,
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
    isMonthDisabled: () => false,
    variant: 'subtle',
    ui: () => ({
      header: 'flex justify-between items-center p-2 sm:px-2',
      body: 'p-2 sm:p-2',
      footer: 'p-2 sm:px-2',
    }),

    hasLabel: false,
  },
);

const childProps = computed(() => ({
  ...props,
  modelValue: modelValue.value,
}));
</script>
