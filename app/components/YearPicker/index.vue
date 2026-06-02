<template>
  <div class="w-fit">
    <YearPickerRange
      v-if="props.range"
      v-bind="childProps"
      @on-select="(data: PickerTypeRange) => modelRange = data" />
  </div>
</template>

<!--
next planned feature:

<YearPickerMultiple
  v-else-if="props.multiple"
  v-bind="childProps" />
<YearPickerSingle
  v-else
  v-bind="childProps" />
-->

<script setup lang="ts">
import type { PickerTypeRange } from '~/types';
import type { CalendarDate } from '@internationalized/date';

// iso compliant
const MIN_YEAR = 1;
const MAX_YEAR = 9999;

const modelRange = defineModel<PickerTypeRange>({
  default: () => ({
    start: null,
    end: null,
  }),
});

const props = withDefaults(
  defineProps<{
    range?: boolean
    multiple?: boolean
    yearsPerPage?: number
    minYear?: number
    maxYear?: number
    isYearDisabled?: (args: CalendarDate) => boolean
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
    yearsPerPage: 10,
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
    isYearDisabled: () => false,
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
  modelValue: modelRange.value,
}));
</script>
