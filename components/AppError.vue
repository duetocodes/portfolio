<template>
  <Transition
    name="fade"
    appear>
    <div
      v-if="props.hasError"
      class="absolute z-100 inset-0 bg-default backdrop-blur-[1px] flex justify-center items-center">
      <UAlert
        :title="`[${err.code}]`"
        class="max-w-sm md:max-w-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        color="error"
        variant="subtle"
        icon="material-symbols:chat-error-outline-rounded">
        <template #description>
          <p class="line-clamp-3">
            {{ err.message }}
          </p>
          <div class="flex justify-end mt-8">
            <UButton
              :label="$t('TryAgain')"
              :aria-label="$t('TryAgain')"
              size="lg"
              color="error"
              variant="ghost"
              icon="material-symbols:app-badging-outline"
              loading-icon="material-symbols:app-badging-outline"
              :loading="props.status === 'pending'"
              @click="emits('try-again')" />
          </div>
        </template>
      </UAlert>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { FetchError } from 'ofetch';
import type { AsyncDataRequestStatus } from '~/types';

const { t: $t } = useI18n();

const props = withDefaults(defineProps<{
  hasError?: boolean
  error?: FetchError | null
  status: AsyncDataRequestStatus
}>(),
{
  hasError: false,
  error: null,
});

const emits = defineEmits(['try-again']);

const err = computed(() => ({
  code: props.error?.statusCode ?? props.error?.data.statusCode ?? $t('Unknown'),
  message: props.error?.data.message || props.error?.statusMessage || props.error?.data.statusMessage || $t('UnexpectedErrorOccurred'),
}));
</script>

<!--
  useFetch() status: 'success' | 'idle' | 'pending' | 'error'
  idle = request has not yet started
  pending = loading
  success = 200
  error = fetch failed
-->
<!--
sample error:

{
  "message": "[GET] \"/api/about-me\": 500 Server Error",
  "statusCode": 500,
  "statusMessage": "Server Error",
  "data": {
    "error": true,
    "url": "http://localhost:3000/api/about-me",
    "statusCode": 500,
    "statusMessage": "Server Error",
    "message": "",
    "stack": [
      "",
      "at createError (/Users/freddiemay/duetocodes/node_modules/h3/dist/index.mjs:71:15)",
      "at Object.handler (/Users/freddiemay/duetocodes/server/api/about-me.get.ts:30:1)",
      "at async file:///Users/freddiemay/duetocodes/node_modules/h3/dist/index.mjs:2003:19)",
      "at async Object.callAsync (/Users/freddiemay/duetocodes/node_modules/unctx/dist/index.mjs:72:16)",
      "at async toNodeHandle (/Users/freddiemay/duetocodes/node_modules/h3/dist/index.mjs:2295:7)",
      "at async b (/Users/freddiemay/duetocodes/node_modules/node-mock-http/dist/index.mjs:1:6827)",
      "at async C (/Users/freddiemay/duetocodes/node_modules/node-mock-http/dist/index.mjs:1:7110)",
      "at async $fetchRaw2 (/Users/freddiemay/duetocodes/node_modules/ofetch/dist/shared/ofetch.03887fc3.mjs:258:26)",
      "at async $fetchRaw2 (/Users/freddiemay/duetocodes/node_modules/ofetch/dist/shared/ofetch.03887fc3.mjs:311:14)",
      "at async $fetch2 (/Users/freddiemay/duetocodes/node_modules/ofetch/dist/shared/ofetch.03887fc3.mjs:316:15)"
    ]
  }
}
-->
