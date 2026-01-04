<template>
  <ClientOnly>
    <template #fallback>
      <UButton
        size="xl"
        loading
        variant="ghost"
        color="neutral"
        :aria-label="isDark ? TEXTS.Dark : TEXTS.Light"
        loading-icon="material-symbols:app-badging-outline"
        :ui="{ leadingIcon: 'size-5 md:size-6' }" />
    </template>
    <UButton
      size="xl"
      variant="ghost"
      color="neutral"
      class="text-muted"
      :aria-label="isDark ? TEXTS.Dark : TEXTS.Light"
      :icon="isDark ? 'material-symbols:moon-stars-outline-rounded' : 'material-symbols:sunny-outline-rounded'"
      :ui="{ leadingIcon: 'size-5 md:size-6' }"
      @click="toggle" />
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const { TEXTS } = useNonReactiveTranslation();

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light';
  },
});

const toggle = () => {
  isDark.value = !isDark.value;
};
</script>
