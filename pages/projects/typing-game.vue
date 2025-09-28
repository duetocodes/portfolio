<template>
  <div class="w-full min-h-[inherit]">
    <UBreadcrumb
      class="mt-8"
      :items="crumbItems"
      :ui="{ link: 'text-lg' }" />

    <MDC
      v-if="overview?.data?.[0]?.description"
      :value="overview.data[0].description"
      class="line-clamp-5 text-md text-pretty whitespace-pre-line prose dark:prose-invert text-muted [&_a:after]:content-['_↗']"
      tag="article" />
    <p
      v-else
      class="text-md prose text-muted">
      {{ $t('SelfDevelopedApplications', 1) }}
    </p>

    <ClientOnly>
      <div
        v-if="isSmallerThan1024 && !isForceContinue"
        class="absolute z-100 inset-0 bg-default/1 backdrop-blur-[1px] flex justify-center items-center">
        <UAlert
          :title="$t('PhysicalKeyboardRequired')"
          class="max-w-sm md:max-w-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          color="info"
          variant="subtle">
          <template #description>
            <p>
              {{ $t('TypingGameText1') }}
            </p>
            <UButton
              class="mt-4"
              :label="$t('Continue')"
              block
              color="neutral"
              variant="subtle"
              @click="() => {
                isForceContinue = true;
                execute();
              }" />
          </template>
        </UAlert>
      </div>
    </ClientOnly>

    <AppLoadingIndicator
      :is-loading="status === 'pending' && !error"
      icon="simple-icons:openai"
      :ui="{ iconClass: 'breath-effect' }" />

    <AppError
      :has-error="status === 'error' || Boolean(error)"
      :error="error"
      :status="status"
      @try-again="refresh" />

    <div
      v-if="passage.length"
      class="mt-8 flex gap-x-4">
      <UAlert
        class="w-44"
        color="info"
        variant="soft"
        icon="material-symbols:speed-outline-rounded">
        <template #title>
          <div class="flex justify-between">
            <span>Pace (wpm)</span>
            <UTooltip
              class="select-none"
              text="words per minute, where one word equals 5 typed characters (including spaces)."
              :delay-duration="0"
              :ui="{
                content: 'max-w-80 h-auto',
                text: 'overflow-visible text-clip whitespace-normal',
              }">
              <UIcon name="material-symbols:info-outline-rounded" />
            </UTooltip>
          </div>
        </template>
        <template #description>
          <div class="text-toned flex divide-x-2 divide-dotted divide-muted">
            <div class="pr-2">
              <span class="text-4xl font-bold">{{ isNaN(gameStats.rawWpm) ? '--' : gameStats.rawWpm }}</span>
              <div class="text-muted text-sm text-center">
                raw
              </div>
            </div>
            <div class="pl-2 mt-auto">
              <span class="text-xl font-bold">{{ isNaN(gameStats.finalWpm) ? '--' : gameStats.finalWpm }}</span>
              <div class="text-muted text-sm text-center">
                final
              </div>
            </div>
          </div>
        </template>
      </UAlert>
      <UAlert
        title="Accuracy (%)"
        class="w-46"
        color="info"
        variant="soft"
        icon="material-symbols:target">
        <template #title>
          <div class="flex justify-between">
            <span>Accuracy (%)</span>
            <UTooltip
              class="select-none"
              :delay-duration="0"
              :ui="{
                content: 'max-w-80 h-auto',
                text: 'overflow-visible text-clip whitespace-normal',
              }">
              <UIcon name="material-symbols:info-outline-rounded" />
              <template #content>
                <ul class="ml-2 p-2 list-disc space-y-2">
                  <li>
                    Raw: measures how accurately you typed on your <span class="font-bold">first attempt</span>, without corrections.
                  </li>
                  <li>
                    Final: measures your overall accuracy <span class="font-bold">after corrections</span>, based on the final submitted text.
                  </li>
                </ul>
              </template>
            </UTooltip>
          </div>
        </template>
        <template #description>
          <div class="text-toned flex divide-x-2 divide-dotted divide-muted">
            <div class="pr-2">
              <span class="text-4xl font-bold">
                {{ isNaN(gameStats.rawAccuracy) ? '--' : gameStats.rawAccuracy }}
              </span>
              <div class="text-muted text-sm text-center">
                raw
              </div>
            </div>
            <div class="pl-2 mt-auto">
              <span class="text-xl font-bold">
                {{ isNaN(gameStats.finalAccuracy) ? '--' : gameStats.finalAccuracy }}
              </span>
              <div class="text-muted text-sm text-center">
                final
              </div>
            </div>
          </div>
        </template>
      </UAlert>

      <Transition
        name="slide-up"
        mode="out-in">
        <UAlert
          v-if="game.status === 'gameover'"
          color="info"
          variant="soft"
          :icon="feedbackStatus === 'pending' ? 'material-symbols:app-badging-outline' : 'simple-icons:openai'"
          :ui="{
            root: 'flex-1',
            title: 'flex justify-between items-center',
            icon: feedbackStatus === 'pending' ? 'animate-spin' : '',
          }">
          <template #title>
            <span>
              Coach
            </span>
            <UTooltip
              v-if="feedbackData?.feedback"
              text="AI-generated content"
              :delay-duration="0">
              <UBadge
                class="select-none"
                label="AI"
                size="sm"
                color="neutral"
                variant="subtle" />
            </UTooltip>
          </template>
          <template #description>
            <MDC
              v-if="feedbackData?.feedback"
              :value="feedbackData.feedback"
              class="text-sm text-muted font-normal text-pretty whitespace-pre-line prose dark:prose-invert"
              tag="article" />
            <span
              v-else-if="feedbackStatus === 'pending'"
              class="text-sm text-muted font-normal">
              Getting feedback...
            </span>
            <span
              v-else
              class="text-sm text-muted font-normal">
              {{ status === 'pending' ? 'Cancelled' : 'Coach currently not available.' }}
            </span>
          </template>
        </UAlert>
        <UAlert
          v-else
          title="Countdown"
          color="info"
          variant="soft"
          icon="material-symbols:nest-clock-farsight-analog-outline-rounded"
          :ui="{ root: 'w-auto' }">
          <template #description>
            <div class="text-toned">
              <span
                class="font-bold text-4xl"
                :class="[
                  { 'text-error': game.timeLeft >= 0 && game.timeLeft <= 5 },
                  { 'text-warning': game.timeLeft >= 6 && game.timeLeft <= 10 },
                  { 'text-toned': game.timeLeft >= 11 && game.timeLeft <= GAME_DURATION },
                ]">
                {{ String(game.timeLeft).padStart(2, '0') }}
              </span>
              <span class="text-base font-semibold text-toned">s</span>
            </div>
          </template>
        </UAlert>
      </Transition>
    </div>

    <div
      v-if="data?.topic"
      class="mt-6 gap-x-4 flex justify-between items-center">
      <span class="flex items-center gap-x-4">
        <span class="text-3xl text-toned font-semibold">
          {{ data.topic }}
        </span>
        <UTooltip
          text="AI-generated content"
          :delay-duration="0">
          <UBadge
            class="select-none"
            label="AI"
            size="sm"
            color="neutral"
            variant="outline" />
        </UTooltip>
      </span>
      <div class="space-x-4">
        <UButtonGroup size="md">
          <UButton
            color="neutral"
            variant="outline"
            icon="material-symbols:text-decrease-rounded"
            :disabled="passageStyleIndex === 0"
            @click="() => {
              passageStyleIndex--;
              passageContainer?.focus();
            }" />
          <UButton
            color="neutral"
            variant="outline"
            icon="material-symbols:text-increase-rounded"
            :disabled="passageStyleIndex === PASSAGE_STYLE_OPTIONS.length - 1"
            @click="() => {
              passageStyleIndex++;
              passageContainer?.focus();
            }" />
        </UButtonGroup>
        <UButton
          class="self-center order-last"
          size="md"
          color="neutral"
          variant="soft"
          icon="material-symbols:app-badging-outline"
          loading-icon="material-symbols:app-badging-outline"
          :label="game.status === 'gameover' ? 'Play Again' : 'Reset'"
          :loading="status === 'pending'"
          @click="onRefreshGame" />
      </div>
    </div>
    <div
      v-if="passage.length"
      ref="passageContainer"
      class="container mt-2 focus:outline-none"
      tabindex="0"
      @focus="game.hasFocus = true"
      @blur="game.hasFocus = false"
      @keydown.prevent="onType">
      <p
        class="font-mono whitespace-break-spaces"
        :class="[PASSAGE_STYLE_OPTIONS[passageStyleIndex]]">
        <span
          v-for="(char, index) in passage"
          :key="index"
          class="relative">
          <span
            class="absolute inset-0 rounded-xs pulse-current-index"
            :class="[{ 'bg-cyan-500 dark:bg-cyan-300': index === currentIndex && game.hasFocus }]" />

          <span
            v-if="char.char === ' '"
            :class="[{ 'bg-error/30 rounded-xs': char.status === 'wrong' }]">
            {{ char.display }}
          </span>
          <span
            v-else
            :class="[
              { 'text-muted': char.status === 'pending' },
              { 'text-success': char.status === 'correct' },
              { 'text-error': char.status === 'wrong' },
            ]">
            {{ char.display }}
          </span>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import type { BreadcrumbItem } from '@nuxt/ui';
import type {
  typingGameFeedbackRequestCharacter,
  typingGameGptFeedbackPayload,
  ProjectItemData,
} from '~/types';

type Character = {
  char: string
  display: string
  expectedKey: string
  lastTypedKey: string | undefined
  status: 'pending' | 'correct' | 'wrong'
  numberOfTry: number
  firstTryAt: number | undefined
};
type Game = {
  hasFocus: boolean
  timerId: number
  timeLeft: number
  status: 'standby' | 'playing' | 'gameover'
};
type TypingGameStats = {
  rawWpm: number
  rawAccuracy: number
  finalWpm: number
  finalAccuracy: number
};

const breakpoints = useBreakpoints(breakpointsTailwind, { ssrWidth: 640 }); // 640px is 'sm' in Tailwind by default
// true or false compared to ssrWidth. So we took the mobile-first approach, and aimed for true onMounted
const isSmallerThan1024 = breakpoints.smaller('lg');

const isForceContinue = ref(false);
const controller = ref<AbortController>();

const passageStyleIndex = ref(2);
const PASSAGE_STYLE_OPTIONS = [
  'text-lg tracking-wide',
  'text-xl/10 tracking-wide',
  'text-2xl/11 tracking-wide',
  'text-3xl/12 tracking-wider',
];
const GAME_DURATION = 60; // seconds
const CHARACTERS_PER_WORD = 5;
const passageContainer = ref<HTMLElement | null>(null);

const game = reactive<Game>({
  hasFocus: false,
  timerId: 0,
  timeLeft: GAME_DURATION,
  status: 'standby',
});

const passage = ref<Character[]>([]);
const currentIndex = ref(0); // where the cursor is now

const toast = useToast();
const { t: $t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const nuxtApp = useNuxtApp();

const crumbItems = computed<BreadcrumbItem[]>(() => [
  {
    to: localePath('/projects'),
    label: $t('Projects'),
  },
  {
    to: route.fullPath,
    label: $t('TypingGame'),
  },
]);

const gameStats = computed((): TypingGameStats => {
  const pressed = passage.value.filter(char => char.status !== 'pending');

  if (game.status === 'playing' || game.status === 'gameover') {
    const elapsedTime = (GAME_DURATION - game.timeLeft) || GAME_DURATION;

    const rawCorrects = pressed.filter(char => (char.status === 'correct' && char.numberOfTry === 1)).length;
    const rawAccuracy = Math.floor((rawCorrects / pressed.length) * 100);
    const rawWpm = Math.floor((rawCorrects / CHARACTERS_PER_WORD) / (elapsedTime / GAME_DURATION));

    const finalCorrects = pressed.filter(char => char.status === 'correct').length;
    const finalAccuracy = Math.floor((finalCorrects / pressed.length) * 100);
    const finalWpm = Math.floor((finalCorrects / CHARACTERS_PER_WORD) / (elapsedTime / GAME_DURATION));

    return {
      rawWpm,
      rawAccuracy,
      finalWpm,
      finalAccuracy,
    };
  }
  else {
    return {
      rawWpm: NaN,
      rawAccuracy: NaN,
      finalWpm: NaN,
      finalAccuracy: NaN,
    };
  }
});

const {
  // non-crucial data
  data: overview,
} = useFetch<ProjectItemData>(
  '/api/projects',
  {
    method: 'GET',
    key: route.fullPath,
    getCachedData(key) {
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      return data;
    },
    query: {
      'locale': locale.value,
      'filters[identifier][$eq]': 'typing-game',
      'populate[preview][populate][image][fields]': ['url', 'alternativeText', 'width', 'height', 'mime'],
      'fields': 'description',
    },
  },
);

const {
  data,
  status,
  error,
  refresh,
  execute,
} = await useLazyFetch('/api/gpt-typing-game', {
  method: 'GET',
  immediate: false,
  server: false,
  watch: false,
  retry: 0, // disable re-tries
  onResponseError() {
    toastUnsuccessful();
    // also handled with <AppError />
  },
  onResponse({ response }) {
    if (response._data?.passage) {
      resetGame();
      const temp = response._data.passage.split('');

      passage.value = []; // reset first to avoid flickering
      nextTick(() => {
        passage.value = temp.map((char: string): Character => {
          const isNewline = char === '\n';
          return {
            char,
            display: isNewline ? '↵\n' : char,
            expectedKey: isNewline ? 'Enter' : char,
            lastTypedKey: undefined,
            status: 'pending',
            numberOfTry: 0,
            firstTryAt: undefined,
          };
        });
      }).then(() => {
        passageContainer.value?.focus();
      });
    }
    else {
      // unknown situation
      toastUnsuccessful();
    }
  },
});

const {
  data: feedbackData,
  status: feedbackStatus,
  execute: executeFeedback,
  clear: clearFeedback,
} = await useLazyFetch('/api/gpt-typing-game-feedback', {
  method: 'POST',
  immediate: false,
  server: false,
  watch: false,
  retry: 0, // disable re-tries
  onRequest({ options }) {
    const attempted = passage.value.reduce((acc: typingGameFeedbackRequestCharacter[], char: Character) => {
      if (char.numberOfTry > 0) {
        acc.push({
          expectedKey: char.expectedKey,
          lastTypedKey: char.lastTypedKey,
          status: char.status,
          numberOfTry: char.numberOfTry,
          firstTryAt: char.firstTryAt,
        });
      }
      return acc;
    }, []);

    options.body = {
      result: attempted,
      ...gameStats.value,
    } satisfies typingGameGptFeedbackPayload;

    controller.value = new AbortController(); // renews for every fetch
    options.signal = controller.value.signal;
  },
});

onMounted(() => {
  nextTick(() => {
    // start with client-side updated value (see ClientOnly above)
    if (import.meta.client && !isSmallerThan1024.value) {
      execute();
    }
  });
});

const onType = (event: KeyboardEvent) => {
  const accepted = ['Backspace', 'Enter'];
  const key = event.key;

  const isKeyAccepted = accepted.includes(key) || key.length === 1;

  if (!game.hasFocus || !isKeyAccepted) return;

  switch (game.status) {
    case 'gameover':
      return;
    case 'playing':
      if (currentIndex.value >= passage.value.length) {
        // in case user finishes before time's up
        endGame();
        return;
      }
      break;
    case 'standby':
      startGame();
      break;
    default:
      return;
  }

  switch (key) {
    case 'Backspace': {
      if (currentIndex.value > 0) {
        currentIndex.value--;
        const prevChar = { ...passage.value[currentIndex.value] };
        prevChar.status = 'pending';
        prevChar.lastTypedKey = undefined;
        passage.value[currentIndex.value] = prevChar;
      }
      break;
    }

    default: {
      const char = { ...passage.value[currentIndex.value] };

      if (char.numberOfTry === 0) {
        char.firstTryAt = new Date().getTime();
      }
      char.numberOfTry++;
      char.lastTypedKey = key;

      const expectedKey = char.expectedKey;
      if (key === expectedKey) {
        char.status = 'correct';
      }
      else {
        char.status = 'wrong';
      }
      passage.value[currentIndex.value] = char;
      currentIndex.value++;
      break;
    }
  }
};

const onRefreshGame = () => {
  if (feedbackStatus.value === 'pending') {
    clearFeedback(); // reset feedback
    controller.value?.abort(); // abort ongoing feedback request (still completes server-side)
  }
  clearInterval(game.timerId);
  refresh();
};

const resetGame = () => {
  clearInterval(game.timerId);
  currentIndex.value = 0;
  game.timeLeft = GAME_DURATION;
  game.status = 'standby';
};

const startGame = () => {
  clearInterval(game.timerId);
  game.status = 'playing';
  clearFeedback();
  startCountdown();
};
const endGame = () => {
  clearInterval(game.timerId);
  game.timeLeft = 0;
  game.status = 'gameover';
  game.hasFocus = false;
};

const startCountdown = () => {
  game.timerId = window.setInterval(() => {
    game.timeLeft--;

    if (game.timeLeft <= 0) {
      // time's up
      endGame();
      executeFeedback();
    }
  }, 1000);
};

const toastUnsuccessful = () => {
  toast.add({
    title: $t('Unsuccessful'),
    description: $t('UnexpectedErrorOccurred'),
    color: 'error',
  });
};
</script>

<style scoped>
@keyframes pulse-current-index {
  0%, 100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.25;
  }
}
.pulse-current-index {
  animation: pulse-current-index 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
