// to format document: npx eslint --fix component/YearPicker.vue

import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'no-console': ['warn'], // warn on console logs'],
    '@stylistic/semi': ['off'], // disable default no-semicolon rule
    '@stylistic/operator-linebreak': ['off'],
    'semi': ['error', 'always'], // enforces semicolons
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never', // <-- Allow self-closing tags on the same line
      multiline: 'never',
    }],
    'vue/html-self-closing': 'off',
    'quote-props': ['error', 'consistent-as-needed'],
  },
});
