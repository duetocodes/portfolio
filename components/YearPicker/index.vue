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

const model = defineModel<YearPickerTypeRange>({ default: null });

const props = withDefaults(
  defineProps<{
    range?: boolean
    multiple?: boolean
    yearsPerPage?: number
    minYear?: number
    maxYear?: number
    isYearDisabled?: (args: number | null) => boolean
    variant?: 'subtle' | 'outline' | 'solid' | 'soft'
    ui?: {
      root?: string
      header?: string
      body?: string
      footer?: string
    }
  }>(),
  {
    range: false,
    multiple: false,
  },
);

const childProps = computed(() => ({
  ...props,
  val: model.value,
}));
</script>
