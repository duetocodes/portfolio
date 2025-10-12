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
import type { PickerTypeRange } from '~/types';

// iso compliant
const MIN_YEAR = 1;
const MAX_YEAR = 9999;

const model = defineModel<number | PickerTypeRange>({ default: null });
const currentYear = ref(new Date().getFullYear());

const props = withDefaults(
  defineProps<{
    range?: boolean
    multiple?: boolean
    yearsPerPage?: number
    isYearDisabled?: (args: number) => boolean
  }>(),
  {
    range: false,
    multiple: false,
    yearsPerPage: 16,
    isYearDisabled: () => false,
  },
);

const childProps = computed(() => ({
  ...props,
  val: model.value,
  rangeStart: MIN_YEAR,
  rangeEnd: MAX_YEAR,
  currentYear: currentYear.value,
}));
</script>
