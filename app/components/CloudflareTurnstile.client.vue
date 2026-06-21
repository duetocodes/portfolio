<template>
  <div class="flex">
    <div id="turnstile-container" />
    <UButton
      label="reset"
      @click="onReset" />
  </div>
</template>

<!--
Approach:
- to render turnstile explicitly
- render client-side as this depends on the `window` object
- Widget Mode: `Managed`

// Tokens are single-use and expire after 300 seconds (five minutes)
// callback: Triggered when the challenge is successfully completed.
// error-callback: Triggered when an error occurs during the challenge (network-error or challenge failed)
// expired-callback: Triggered when a token expires (before timeout).
// timeout-callback: Triggered when an interactive challenge times out.

test siteKeys
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

const { t: $t, locale } = useI18n();
const toast = useToast();
const config = useRuntimeConfig();

const widgetId = ref<string | null>(null);

useHead(() => ({
  script: [
    {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
      defer: true,
      onerror: () => {
        toast.add({
          title: $t('UnexpectedErrorOccurred'),
          color: 'error',
        });
      },
      onload: () => {
        render();
      },
    },
  ],
}));

const render = () => {
  const turnstile = window.turnstile;

  if (!turnstile) {
    return toast.add({
      title: $t('UnexpectedErrorOccurred'),
      color: 'error',
    });
  }

  widgetId.value = turnstile.render(
    '#turnstile-container',
    {
      'language': locale.value,
      'sitekey': config.public.turnstileSiteKey,
      // 'sitekey': '3x00000000000000000000FF',
      'appearance': 'always',
      // 'execution': 'execute',
      'callback': (token: TurnstileToken) => {
        onVerified(token);
      },
      'error-callback': () => {
        if (widgetId.value && turnstile) {
          // turnstile.reset(widgetId.value);
        }
      },
      'expired-callback': () => {
        if (widgetId.value && turnstile) {
          // turnstile.reset(widgetId.value);
        }
      },
      'timeout-callback': () => {
        if (widgetId.value && turnstile) {
          turnstile.reset(widgetId.value);
        }
      },
    },
  );
};

const onVerified = async (token: TurnstileToken) => {
  try {
    const { data } = await useFetch(
      '/api/turnstile',
      {
        method: 'POST',
        server: false,
        body: {
          token,
        },
      },
    );

    if (data.value?.success) {
      toast.add({
        title: 'SUCCESSFUL',
        color: 'success',
      });
    }
  }
  catch (err) {
    toast.add({
      title: $t('UnexpectedErrorOccurred'),
      description: JSON.stringify(err),
      color: 'error',
    });
  }
};

const onReset = () => {
  const turnstile = window.turnstile;

  if (widgetId.value && turnstile) {
    turnstile.reset(widgetId.value);
  }
};
</script>
