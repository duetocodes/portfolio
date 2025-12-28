<template>
  <div
    class="relative
      mx-auto px-4 sm:px-6 pb-96 sm:pb-48 md:pb-16
      max-w-5xl w-full min-w-0 min-h-[100svh]
      overflow-auto">
    <Transition
      name="fade-main"
      mode="out-in">
      <div :key="head.title">
        <h2 class="pt-8 font-medium text-default max-sm:hidden text-lg">
          {{ head.title }}
        </h2>
        <p class="prose text-md text-muted max-sm:pt-4">
          {{ head.description }}
        </p>
      </div>
    </Transition>

    <slot />
  </div>
</template>

<script setup lang="ts">
const { t: $t } = useI18n();
const route = useRoute();

const head = computed(() => {
  const path = route.path;

  if (path.endsWith('/projects')) {
    return {
      title: $t('Projects'),
      description: $t('SelfDevelopedApplications', 2),
    };
  }
  else if (path.endsWith('/tech-stacks')) {
    return {
      title: $t('MyTechStacks'),
      description: $t('TechStackHelpText'),
    };
  }
  else return {
    title: $t('Welcome'),
    description: $t('Introduction'),
  };
});
</script>
