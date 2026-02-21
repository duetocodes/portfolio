// flat locale.json only

import { describe, test, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

// Adjust this path if your locale directory changes
const localesDir = resolve(process.cwd(), 'i18n/locales');

// Load all locale JSON files dynamically
const localeFiles = readdirSync(localesDir).filter(file =>
  file.endsWith('.json'),
);

const locales: Record<
  string,
  Record<string, string>
> = {};

localeFiles.forEach((file) => {
  const localeName = file.replace('.json', '');
  const filePath = join(localesDir, file);
  const content = JSON.parse(readFileSync(filePath, 'utf-8'));
  locales[localeName] = content;
});

if (!locales.en) {
  throw new Error('en.json must exist as the source of truth');
}

const { en, ...otherLocales } = locales;
const enKeys = Object.keys(en);
const otherLocaleEntries = Object.entries(otherLocales);

// when string has named interpolation .i.e, "Select {item}"
const extractPlaceholders = (value: string): string[] => {
  const matches = value.match(/\{(.*?)\}/g);
  return matches ? matches.map(m => m.slice(1, -1)) : [];
};

describe('missing keys', () => {
  otherLocaleEntries.forEach(([locale, obj]) => {
    test(
      `${locale}.json`,
      () => {
        const localeKeys = Object.keys(obj);

        const missing = enKeys.filter(
          key => !localeKeys.includes(key),
        );

        expect(missing).toEqual([]);
      });
  });
});

describe('extra keys', () => {
  otherLocaleEntries.forEach(([locale, obj]) => {
    test(
      `${locale}.json`,
      () => {
        const localeKeys = Object.keys(obj);
        const extra = localeKeys.filter(
          key => !enKeys.includes(key),
        );

        expect(extra).toEqual([]);
      });
  });
});

describe('{placeholder} inconsistency', () => {
  otherLocaleEntries.forEach(([locale, obj]) => {
    test(
      `${locale}.json`,
      () => {
        const mismatches: string[] = [];

        Object
          .entries(en)
          .forEach(([key, value]) => {
            const enPlaceholders = extractPlaceholders(value);
            const localeValue = obj[key];
            if (localeValue === undefined) return; // skip if key is missing, already tested in missing keys test

            const localePlaceholders = extractPlaceholders(localeValue);

            if (
              JSON.stringify(enPlaceholders.sort()) !==
              JSON.stringify(localePlaceholders.sort())
            ) {
              mismatches.push(key);
            }
          });

        expect(mismatches).toEqual([]);
      });
  });
});
