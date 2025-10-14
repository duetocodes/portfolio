<template>
  <div class="w-fit">
    <YearPickerRange
      v-if="props.range"
      v-bind="childProps"
      @on-select="data => model = data" />
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
import type { YearPickerTypeRange } from '~/types';

// iso compliant
const MIN_YEAR = 1;
const MAX_YEAR = 9999;

const model = defineModel<number | YearPickerTypeRange>({ default: null });

const props = withDefaults(
  defineProps<{
    range?: boolean
    multiple?: boolean
    yearsPerPage?: number
    minYear?: number
    maxYear?: number
    isYearDisabled?: (args: number | null) => boolean
  }>(),
  {
    range: false,
    multiple: false,
    yearsPerPage: 16,
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
    isYearDisabled: () => false,
  },
);

const childProps = computed(() => ({
  ...props,
  val: model.value,
}));
</script>
