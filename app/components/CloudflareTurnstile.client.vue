<template>
  <div class="flex flex-col">
    <div class="mb-4 flex flex-col gap-2">
      <p>
        {{ widgetId || 'empty' }}
      </p>
      <div class="flex gap-2">
        <UButton
          label="render"
          variant="subtle"
          @click="onRender" />
        <UButton
          label="execute"
          variant="subtle"
          @click="onExecute" />
      </div>
      <div class="flex gap-2">
        <UButton
          label="reset"
          color="error"
          variant="subtle"
          @click="onReset" />
        <UButton
          label="remove"
          color="error"
          variant="subtle"
          @click="onRemove" />
      </div>
      <div class="flex gap-2">
        <UButton
          label="get-response"
          color="info"
          variant="subtle"
          @click="onGetResponse" />
        <UButton
          label="isExpired"
          color="info"
          variant="subtle"
          @click="checkIsExpired" />
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
const toast = useToast();
const hasScriptLoaded = ref(false);
const config = useRuntimeConfig();

const widgetId = ref<string>('');

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
        hasScriptLoaded.value = true;
      },
    },
  ],
}));

const onRender = () => {
  if (!hasScriptLoaded.value) return;
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
        onVerified(token);
      },
      'error-callback': (err) => {
        if (widgetId.value && turnstile) {
          toast.add({
            title: 'error-callback',
            description: JSON.stringify(err) || '_undefined',
            color: 'error',
          });
        }
      },
      'expired-callback': (err) => {
        if (widgetId.value && turnstile) {
          toast.add({
            title: 'error-callback',
            description: JSON.stringify(err) || '_undefined',
            color: 'error',
          });
        }
      },
      'timeout-callback': (err) => {
        if (widgetId.value && turnstile) {
          toast.add({
            title: 'error-callback',
            description: JSON.stringify(err) || '_undefined',
            color: 'error',
          });
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
  widgetId.value = '';
};

const onRemove = () => {
  const turnstile = window.turnstile;
  turnstile?.remove('#dtc-turnstile-container');
  widgetId.value = '';
};

const onExecute = () => {
  const turnstile = window.turnstile;

  turnstile?.execute('#dtc-turnstile-container');
};

const onGetResponse = () => {
  const turnstile = window.turnstile;
  const resp = turnstile?.getResponse(widgetId.value);
  toast.add({
    title: JSON.stringify(resp) || '_undefined',
    color: 'info',
  });
};

const checkIsExpired = () => {
  const turnstile = window.turnstile;
  const bool = turnstile?.isExpired(widgetId.value);
  toast.add({
    title: JSON.stringify(bool) || '_undefined',
    color: 'info',
  });
};
</script>
