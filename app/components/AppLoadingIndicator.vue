<!--
modal with overlay type loading screen
-->

<template>
  <Transition
    name="fade"
    appear>
    <div
      v-if="props.isLoading"
      class="absolute z-100 inset-0 bg-default/1 backdrop-blur-[1px] flex justify-center items-center">
      <UIcon
        :name="props.icon"
        class="size-10 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted"
        :class="[props.ui.iconClass]" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  isLoading?: boolean
  icon?: string
  ui?: {
    iconClass?: string
  }
}>(),
{
  isLoading: false,
  icon: 'material-symbols:app-badging-outline',
  ui: () => ({
    iconClass: 'animate-spin',
  }),
});
</script>

<style scoped>
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.6;
  }
}
.breath-effect {
  animation: breathe 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
