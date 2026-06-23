<template>
  <div class="flex flex-col">
    <div class="mb-4 flex flex-col gap-2">
      <div class="flex gap-2">
        <UButton
          :label="TEXTS.StartDemo"
          variant="subtle"
          icon="material-symbols:app-badging-outline"
          :loading="isLoading"
          @click="resetThenRender" />
      </div>
    </div>

    <div id="dtc-turnstile-container" />
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
const { TEXTS } = useNonReactiveTranslation();
const toast = useToast();
const config = useRuntimeConfig();

const widgetId = ref('');
const isLoading = ref(false);

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

const resetThenRender = () => {
  resetThenRemove();

  nextTick(() => {
    renderThenExecute();
  });
};

const renderThenExecute = () => {
  try {
    const turnstile = window.turnstile;

    if (!turnstile) {
      toast.add({
        title: $t('UnexpectedErrorOccurred'),
        color: 'error',
      });
      return;
    }

    widgetId.value = turnstile.render(
      '#dtc-turnstile-container',
      {
        'language': locale.value,
        'sitekey': config.public.turnstileSiteKey,
        'appearance': 'always',
        'execution': 'execute', // manually execute challenge
        'callback': (token: TurnstileToken) => {
          onVerifiedClientSide(token);
        },
        'error-callback': (err) => {
          if (widgetId.value && turnstile) {
            toast.add({
              title: 'error-callback',
              description: JSON.stringify(err) || '_undefined',
              color: 'error',
            });
          }
          isLoading.value = false;
        },
        'expired-callback': (err) => {
          if (widgetId.value && turnstile) {
            toast.add({
              title: 'expired-callback',
              description: JSON.stringify(err) || '_undefined',
              color: 'error',
            });
          }
          isLoading.value = false;
        },
        'timeout-callback': (err) => {
          if (widgetId.value && turnstile) {
            toast.add({
              title: 'timeout-callback',
              description: JSON.stringify(err) || '_undefined',
              color: 'error',
            });
          }
          isLoading.value = false;
        },
      },
    );

    if (widgetId.value) {
      turnstile.execute(widgetId.value);
    }
  }
  catch {
    toast.add({
      title: $t('UnexpectedErrorOccurred'),
      color: 'error',
    });
  }
};

const onVerifiedClientSide = async (token: TurnstileToken) => {
  isLoading.value = true;

  $fetch(
    '/api/turnstile',
    {
      method: 'POST',
      body: {
        token,
      },
    },
  )
    .then(({ success }) => {
      if (success) {
        toast.add({
          title: 'Server',
          description: 'Successful server-side validation',
          color: 'success',
        });
      }
      else {
        toast.add({
          title: 'Server',
          description: 'Failed server-side validation',
          color: 'error',
        });
      }
    })
    .catch(() => {
      toast.add({
        title: $t('UnexpectedErrorOccurred'),
        color: 'error',
      });
    })
    .finally(() => {
      isLoading.value = false;
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
</script>
