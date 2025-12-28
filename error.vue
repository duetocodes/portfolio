<template>
  <UApp>
    <UAlert
      title="duetocodes.com"
      class="max-w-sm md:max-w-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      color="error"
      icon="material-symbols:chat-error-outline-rounded">
      <template #description>
        <p class="line-clamp-5 break-normal">
          [{{ err.code }}] {{ err.message }}
        </p>
        <div class="flex justify-end mt-8">
          <UButton
            :label="$t('BackToHome')"
            :aria-label="$t('BackToHome')"
            size="lg"
            color="error"
            icon="material-symbols:home-outline-rounded"
            @click="navigateTo(localePath('/'))" />
        </div>
      </template>
    </UAlert>
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const { t: $t } = useI18n();
const localePath = useLocalePath();

const props = defineProps({
  error: Object as () => NuxtError,
});

const err = computed(() => ({
  code: props.error?.statusCode ?? $t('Unknown'),
  message: props.error?.message || props.error?.statusMessage || $t('UnexpectedErrorOccurred'),
}));
</script>
