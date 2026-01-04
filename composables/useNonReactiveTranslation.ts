// objective: to obtain non-reactive translation client-side's template; as t() is reactive after hydratiion
// already typed
// this fixed the pre-page-transition translation on locale change

// current limitation: lost of reactivity
// use the default t() instead for plurality & named translation .i.e, { item: qty.value }

import EN from '~/i18n/locales/en.json';

type LocaleKeys = keyof typeof EN;

export default function () {
  const { t } = useI18n();

  const keys = Object.keys(EN) as LocaleKeys[];

  const translated = Object.fromEntries(
    keys.map(
      key => [key, t(key)],
    ),
  ) as Record<LocaleKeys, string>;

  return {
    TEXTS: translated,
  };
};
