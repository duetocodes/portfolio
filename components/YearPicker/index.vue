<template>
  <div class="bg-[var(--ui-bg)] p-4 w-fit">
    <div class="flex items-center justify-between mb-4">
      <UButton
        :disabled="!(currentPage > 0)"
        color="neutral"
        variant="ghost"
        @click="currentPage--">
        <Icon
          name="material-symbols:chevron-left"
          class="w-5 h-5" />
      </UButton>

      <div class="text-center text-sm font-medium">
        {{ pageRangeStart }} to {{ pageRangeEnd }}
      </div>

      <UButton
        :disabled="!(currentPage < (totalPages - 1))"
        color="neutral"
        variant="ghost"
        @click="currentPage++">
        <Icon
          name="material-symbols:chevron-right"
          class="w-5 h-5" />
      </UButton>
    </div>

    <div>
      <YearPickerRange
        v-if="props.range"
        v-bind="childProps"
        @on-select="data => model = data" />
      <!-- <YearPickerMultiple
        v-else-if="props.multiple"
        v-bind="childProps" />
      <YearPickerSingle
        v-else
        v-bind="childProps" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { YearPickerTypeRange } from '~/types';

const model = defineModel<number | YearPickerTypeRange>({ default: null });

const props = withDefaults(
  defineProps<{
    range?: boolean
    multiple?: boolean
    minYear?: number
    maxYear?: number
    yearsPerPage?: number
    rangeStart?: number
    rangeEnd?: number
  }>(),
  {
    range: false,
    multiple: false,
    minYear: NaN,
    maxYear: NaN,
    yearsPerPage: 12,
    rangeStart: 1900,
    rangeEnd: 2200,
  },
);

const childProps = computed(() => ({
  ...props,
  displayedYears: displayedYears.value,
  val: model.value,
}));

const allYears = computed(() => {
  return Array.from(
    { length: props.rangeEnd - props.rangeStart + 1 },
    (_, i) => props.rangeEnd - i,
  );
});

const totalPages = computed(() =>
  Math.ceil(allYears.value.length / props.yearsPerPage),
);

const displayedYears = computed(() => {
  const startIndex = currentPage.value * props.yearsPerPage;
  return allYears.value.slice(startIndex, startIndex + props.yearsPerPage);
});

const pageRangeStart = computed(
  () => displayedYears.value[displayedYears.value.length - 1],
);
const pageRangeEnd = computed(() => displayedYears.value[0]);

const getCurrentYearPage = () => {
  const currentYear = new Date().getFullYear();
  const allYearsTemp = Array.from(
    { length: props.rangeEnd - props.rangeStart + 1 },
    (_, i) => props.rangeEnd - i,
  );
  const currentYearIndex = allYearsTemp.indexOf(currentYear);
  return currentYearIndex !== -1
    ? Math.floor(currentYearIndex / props.yearsPerPage)
    : 0;
};

const currentPage = ref(getCurrentYearPage());
</script>
