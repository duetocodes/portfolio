<template>
  <div class="w-full min-h-[inherit]">
    <UBreadcrumb
      class="mt-8"
      separator-icon="material-symbols:chevron-right"
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

    <AppLoadingIndicator
      :is-loading="status === 'pending' && !error"
      icon="simple-icons:openai"
      :ui="{ iconClass: 'breath-effect' }" />

    <AppError
      :has-error="status === 'error' || Boolean(error)"
      :error="error"
      :status="status"
      @try-again="refresh" />

    <ClientOnly>
      <div
        v-if="isPrompt"
        class="mt-44 w-full flex justify-center items-center">
        <UAlert
          :title="$t('PhysicalKeyboardRequired')"
          icon="material-symbols:keyboard-external-input-outline"
          class="max-w-sm md:max-w-md"
          color="info"
          variant="subtle">
          <template #description>
            <p>
              {{ $t('TypingGameText1') }}
            </p>

            <div class="flex justify-end mt-8 gap-x-2">
              <UButton
                :label="$t('GoBack')"
                :aria-label="$t('GoBack')"
                size="lg"
                color="info"
                variant="ghost"
                icon="material-symbols:u-turn-right-rounded"
                @click="navigateTo(localePath('/projects'))" />
              <UButton
                :label="$t('Continue')"
                :aria-label="$t('Continue')"
                size="lg"
                color="info"
                variant="ghost"
                icon="material-symbols:play-arrow"
                @click="isPrompt = false" />
            </div>
          </template>
        </UAlert>
      </div>
    </ClientOnly>

    <div
      v-if="data?.mappedPassage.length"
      v-show="!isPrompt"
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
      v-show="!isPrompt"
      class="mt-6 gap-x-4 flex justify-between items-center">
      <span class="flex items-center gap-x-4">
        <span class="text-lg lg:text-xl xl:text-3xl text-toned font-semibold">
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
          variant="outline"
          icon="material-symbols:app-badging-outline"
          loading-icon="material-symbols:app-badging-outline"
          :label="game.status === 'gameover' ? 'Play Again' : 'Reset'"
          :loading="status === 'pending'"
          @click="onRefreshGame" />
      </div>
    </div>

    <div
      v-if="data?.mappedPassage?.length"
      v-show="!isPrompt"
      :key="data.id"
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
          v-for="(char, index) in data.mappedPassage"
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
import { breakpointsTailwind, useBreakpoints, useStorage } from '@vueuse/core';
import type { BreadcrumbItem } from '@nuxt/ui';
import type {
  TypingGame,
  TypingGameStats,
  TypingGameFeedbackRequestCharacter,
  TypingGameGptFeedbackPayload,
  TypingGameUpdatedData,
  ProjectItemData,
  Character,
} from '~/types';

const breakpoints = useBreakpoints(breakpointsTailwind, { ssrWidth: 1024 });
// true or false compared to ssrWidth. Go mobile-first approach, and aimed for true onMounted
const isSmallerBreakpoint = breakpoints.smaller('xl'); // xl=1280px

const isPrompt = useStorage(
  'dtc-typing-game-prompt',
  true,
  import.meta.client ? sessionStorage : undefined);

const controller = ref<AbortController>();

const passageStyleIndex = ref(0);
const PASSAGE_STYLE_OPTIONS = [
  'text-lg tracking-wide',
  'text-xl/10 tracking-wide',
  'text-2xl/11 tracking-wide',
  'text-3xl/12 tracking-wider',
];
const GAME_DURATION = 60; // seconds
const CHARACTERS_PER_WORD = 5;
const passageContainer = ref<HTMLElement | null>(null);

const game = reactive<TypingGame>({
  hasFocus: false,
  timerId: 0,
  timeLeft: GAME_DURATION,
  status: 'standby',
});

const currentIndex = ref(0); // where the cursor is now
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
  const pressed = (data.value?.mappedPassage || []).filter(char => char.status !== 'pending');

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

whenever(
  () => !isPrompt.value,
  () => nextTick(() => passageContainer.value?.focus()),
);

onMounted(() => {
  nextTick(() => {
    if (!isSmallerBreakpoint.value) {
      passageStyleIndex.value = 2;
      isPrompt.value = false;
    }
  })
    .then(() => {
      passageContainer.value?.focus();
    });
});

onUnmounted(() => {
  clearInterval(game.timerId);
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

useHead({
  link: [{
    rel: 'canonical',
    href: `https://duetocodes.com${route.fullPath}`,
  }],
});

useSeoMeta({
  title: () => `${$t('TypingGame')} - ${$t('Projects')} | duetocodes`,
  description: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogSiteName: () => `${$t('TypingGame')} - ${$t('Projects')} | duetocodes`,
  ogTitle: () => `${$t('TypingGame')} - ${$t('Projects')} | duetocodes`,
  ogDescription: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  ogImage: () => ({
    url: overview.value?.data?.[0].preview?.image?.url,
    alt: overview.value?.data?.[0].preview?.image?.alternativeText,
    width: overview.value?.data?.[0].preview?.image?.width,
    height: overview.value?.data?.[0].preview?.image?.height,
    type: overview.value?.data?.[0].preview?.image?.mime,
  }),
  ogUrl: () => `https://duetocodes.com${route.fullPath}`,
  ogType: 'website',
  twitterTitle: () => `${$t('TypingGame')} - ${$t('Projects')} | duetocodes`,
  twitterDescription: () => stripMarkdownLinks(overview.value?.data?.[0]?.description || ''),
  twitterCard: 'summary_large_image',
  twitterImage: () => ({
    url: overview.value?.data?.[0].preview?.image?.url,
    alt: overview.value?.data?.[0].preview?.image?.alternativeText,
    width: overview.value?.data?.[0].preview?.image?.width,
    height: overview.value?.data?.[0].preview?.image?.height,
    type: overview.value?.data?.[0].preview?.image?.mime,
  }),
});

const {
  data,
  status,
  error,
  refresh,
} = useFetch<TypingGameUpdatedData>('/api/gpt-typing-game', {
  method: 'GET',
  watch: false,
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
    const attempted = (data.value?.mappedPassage || []).reduce((acc: TypingGameFeedbackRequestCharacter[], char: Character) => {
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
    } satisfies TypingGameGptFeedbackPayload;

    controller.value = new AbortController(); // renews for every fetch
    options.signal = controller.value.signal;
  },
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
      if (currentIndex.value >= (data.value?.mappedPassage || []).length) {
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
        const prevChar = { ...(data.value?.mappedPassage || [])[currentIndex.value] };
        prevChar.status = 'pending';
        prevChar.lastTypedKey = undefined;
        (data.value?.mappedPassage || [])[currentIndex.value] = prevChar;
      }
      break;
    }

    default: {
      const char = (data.value?.mappedPassage || [])[currentIndex.value];

      if (char && char.numberOfTry === 0) {
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

      currentIndex.value++;
      break;
    }
  }
};

const onRefreshGame = () => {
  clearInterval(game.timerId);
  if (feedbackStatus.value === 'pending') {
    clearFeedback(); // reset feedback
    controller.value?.abort(); // abort ongoing feedback request (still completes server-side)
  }

  refresh().then(() => {
    resetGame();
    nextTick(() => passageContainer.value?.focus());
  });
};

const resetGame = () => {
  clearInterval(game.timerId);
  currentIndex.value = 0;
  game.timeLeft = GAME_DURATION;
  game.status = 'standby';
  clearFeedback();
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
