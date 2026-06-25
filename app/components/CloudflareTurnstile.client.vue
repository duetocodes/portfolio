<template>
  <div>
    <div id="dtc-turnstile-container" />
  </div>
</template>

<!--
Approach:
- a client-only component
- to render turnstile explicitly
- render client-side as this depends on the `window` object
- Widget Mode: `Managed`

// Tokens are single-use and expire after 300 seconds (five minutes)
// callback: Triggered when the challenge is successfully completed.
// error-callback: Triggered when an error occurs during the challenge (network-error or challenge failed)
// expired-callback: Triggered when a token expires (before timeout).
// timeout-callback: Triggered when an interactive challenge times out.

test siteKeys
https://developers.cloudflare.com/turnstile/troubleshooting/testing/#test-sitekeys
1x00000000000000000000AA; Always passes Visible; Test successful form submissions
2x00000000000000000000AB; Always fails Visible; Test error handling and retry logic
1x00000000000000000000BB; Always passes Invisible; Test invisible widget success flows
2x00000000000000000000BB; Always fails Invisible; Test invisible widget error handling
3x00000000000000000000FF; Forces interactive challenge; Visible Test user interaction scenarios
-->

<script setup lang="ts">
import type { TurnstileToken, TurnstileAPI } from '~~/schemas/turnstile';

declare global {
  interface Window {
    turnstile?: TurnstileAPI
  }
}

const emits = defineEmits([
  'on-success',
  'on-error',
]);

const { t: $t, locale } = useI18n();
const toast = useToast();
const config = useRuntimeConfig();

const widgetId = ref('');
const isLoading = ref(false);

const props = defineProps({
  siteKey: {
    type: String,
  },
});

useHead(() => ({
  script: [
    {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
      defer: true,
      onerror: () => {
        isLoading.value = false;
        toast.add({
          title: $t('UnexpectedErrorOccurred'),
          color: 'error',
        });
      },
    },
  ],
}));

const renderThenExecute = () => {
  nextTick(() => {
    try {
      const turnstile = window.turnstile;

      if (!turnstile) {
        toast.add({
          title: 'Turnstile',
          description: $t('UnexpectedErrorOccurred'),
          color: 'error',
        });
        return;
      }

      widgetId.value = turnstile.render(
        '#dtc-turnstile-container',
        {
          'language': locale.value,
          'sitekey': props.siteKey || config.public.turnstileSiteKey,
          'appearance': 'always',
          'execution': 'execute', // manually execute challenge
          'callback': (token: TurnstileToken) => {
            emits('on-success', token);
          },
          'error-callback': (err) => {
            if (widgetId.value && turnstile) {
              emits('on-error', `'error-callback' ${JSON.stringify(err)}`);
            }
            isLoading.value = false;
          },
          'expired-callback': (err) => {
            if (widgetId.value && turnstile) {
              emits('on-error', `'expired-callback' ${JSON.stringify(err)}`);
            }
            isLoading.value = false;
          },
          'timeout-callback': (err) => {
            if (widgetId.value && turnstile) {
              emits('on-error', `'timeout-callback' ${JSON.stringify(err)}`);
            }
            isLoading.value = false;
          },
        },
      );

      if (widgetId.value) {
        nextTick(() => {
          turnstile.execute(widgetId.value);
        });
      }
    }
    catch {
      emits('on-error');

      toast.add({
        title: 'Turnstile',
        description: $t('UnexpectedErrorOccurred'),
        color: 'error',
      });
    }
  });
};

const resetThenRemove = () => {
  const turnstile = window.turnstile;
  if (turnstile && widgetId.value) {
    turnstile.reset(widgetId.value);
    turnstile.remove(widgetId.value);
    widgetId.value = '';
  }
};

onBeforeRouteLeave(() => {
  resetThenRemove();
});

defineExpose({
  widgetId,
  renderThenExecute,
  resetThenRemove,
});
</script>
