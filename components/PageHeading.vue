<template>
  <div>
    <h2 class="mt-8 font-medium text-default max-sm:hidden text-lg">
      {{ props.heading }}
    </h2>
    <p class="prose text-md text-muted">
      {{ props.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  heading: string
  description?: string
}>(), {
  description: '',
});
</script>
