<template>
  <div
    v-if="props.isLoading"
    class="absolute z-100 inset-0 bg-default/1 backdrop-blur-[1px] flex justify-center items-center">
    <UIcon
      name="material-symbols:app-badging-outline"
      class="size-8 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-muted" />
    <UIcon
      name="material-symbols:app-badging-outline"
      class="size-12 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-muted" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  isLoading?: boolean
}>(),
{
  isLoading: false,
});
</script>
