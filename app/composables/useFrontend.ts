import type { ProjectSlugID } from '~~/schema-types/shared';

export default function () {
  const PROJECT_SLUG_ENUM: Record<ProjectSlugID, { icon: string, iconColor: string }> = {
    'treasury-yield-visualiser': {
      icon: 'material-symbols:table-chart-view-outline-sharp',
      iconColor: 'text-fuchsia-500 dark:text-fuchsia-400',
    },
    'currency-converter': {
      icon: 'material-symbols:currency-exchange',
      iconColor: 'text-violet-500 dark:text-violet-400',
    },
    'typing-game': {
      icon: 'material-symbols:keyboard-outline-sharp',
      iconColor: 'text-sky-500 dark:text-sky-400',
    },
    'know-your-viewport': {
      icon: 'material-symbols:tv-outline-sharp',
      iconColor: 'text-teal-500 dark:text-teal-400',
    },
    'cloudflare-turnstile-demo': {
      icon: 'simple-icons:cloudflare',
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
  };

  return {
    PROJECT_SLUG_ENUM,
  };
};
