<template>
  <ClientOnly>
    <Transition
      name="fade"
      appear>
      <div v-if="alert.isShow">
        <UAlert
          title="CAPTCHA"
          class="max-w-sm md:max-w-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          color="error"
          variant="subtle"
          icon="material-symbols:chat-error-outline-rounded">
          <template #description>
            <p class="line-clamp-3">
              {{ $t(alert.descriptionKey || 'UnexpectedErrorOccurred') }}
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
                :loading="alert.loading"
                @click="loadScriptThenShowCaptcha" />
            </div>
          </template>
        </UAlert>
      </div>

      <div
        v-else
        ref="container" />
    </Transition>
  </ClientOnly>
</template>

<script setup lang="ts">
type TurnstileResponse = {
  success: boolean
};

const config = useRuntimeConfig();
const { t: $t, locale } = useI18n();

const isScriptLoaded = ref(false);
const token = ref();
const container = ref<HTMLElement | null>(null);

const alert = reactive({
  isShow: false,
  descriptionKey: '',
  loading: false,
});

const emits = defineEmits<{
  (e: 'on-verified'): void
}>();

const props = withDefaults(defineProps<{
  successDelay?: number
}>(),
{
  successDelay: 800, // in ms, allow animation to display
});

onMounted(() => {
  if (import.meta.client) {
    loadScriptThenShowCaptcha();
  }
});

const loadScriptThenShowCaptcha = () => {
  alert.loading = true;

  if (isScriptLoaded.value) {
    showCaptcha();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  // script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.defer = true;

  script.onload = () => {
    isScriptLoaded.value = true;
    showCaptcha();
  };

  script.onerror = () => {
    // if script fails to load
    isScriptLoaded.value = false;
    alert.loading = false;
    alert.descriptionKey = 'UnexpectedErrorOccurred';
    alert.isShow = true;
  };

  document.head.appendChild(script);
};

const showCaptcha = async () => {
  alert.loading = true;
  alert.isShow = false;

  await nextTick();

  try {
    // @ts-expect-error: see nuxt.config.ts script injection
    turnstile.render(container.value, {
      'sitekey': config.public.turnstileSiteKey,
      'language': locale.value,
      'callback': (_token: string) => {
        // when CAPTCHA challenge passes
        token.value = _token;
        execute();
      },
      'error-callback': () => {
        // when CAPTCHA challenge fails
        // show UAlert after CATPCHA error message
        setTimeout(() => {
          alert.loading = false;
          alert.descriptionKey = 'VerificationFailed';
          alert.isShow = true;
        }, 5000);
      },
      'expired-callback': () => {
        setTimeout(() => {
          alert.loading = false;
          alert.descriptionKey = 'Expired';
          alert.isShow = true;
        }, 5000);
      },
    });
  }
  catch {
    // if rendering fails
    alert.isShow = true;
  }
  finally {
    alert.loading = false;
  }
};

const {
  execute,
} = await useLazyFetch<TurnstileResponse>('/api/verify-turnstile', {
  method: 'POST',
  immediate: false,
  server: false,
  watch: false,
  onRequest({ options }) {
    options.body = {
      token: token.value,
    };
  },
  onResponse({ response }) {
    if (response?._data?.success) {
      setTimeout(() => {
        emits('on-verified');
      }, props.successDelay);
    }
  },
  onResponseError() {
    alert.descriptionKey = 'UnexpectedErrorOccurred';
    alert.isShow = true;
  },
});
</script>
