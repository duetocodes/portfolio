# duetocodes project guide
This is my personal portfolio site: duetocodes.com

## Business Goals
- This portfolio is intended to rank for:
  - frontend developer
  - vue developer
  - vue.js developer
  - nuxt developer
  - nuxt.js developer
- SEO and discoverability are important.
- Accessibility and performance are important.
- Prefer solutions that improve Core Web Vitals.
- Avoid changes that reduce SSR or crawlability.

## Major Features
- Portfolio project showcase
- Homepage
- Tech Stack page
- Currency Converter
- Treasury Yield Visualiser
- Typing Speed Game
- Multi-language support
- Strapi-backed content

## Stack
- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- i18n locales: en, zh, th, tr
- Deployed on Vercel

## Scope
- These instructions apply to the entire repository.
- This is a Nuxt 4 SSR portfolio application. Keep changes focused and preserve the existing Nuxt auto-import and Vue Composition API patterns.

## Runtime and Setup
- Install dependencies with `npm ci` when starting from a clean checkout.
- Start local development with `npm run dev`.

## Verification
- Run `npm run lint` after code changes.
- Run `npm run test:i18n` when changing locale files or user-facing copy. This is also the current Husky pre-commit check.
- Run `npm run build` for changes that affect Nuxt config, dependencies, routing, layouts, pages, server routes, or production rendering.
- The production build prerenders routes and may exercise server-side content fetching. If it fails, distinguish code failures from missing environment variables or unavailable external services.

## Architecture
- `app.vue` owns the global shell, navigation, locale-aware headings, global metadata, and schema.org person data.
- `pages/` contains the public routes. Project demos live under `pages/projects/`.
- `layouts/project/item.vue` is the shared project-detail layout. Project detail pages set `layout: 'project-item'`, `slugId`, and `slugLabel` with `definePageMeta`.
- `server/api/` contains Nitro API routes. Keep upstream credentials server-side through private runtime config; never expose tokens to client code.
- `schemas/` contains shared Zod schemas. Reuse schema validation at request boundaries instead of adding ad hoc validation.
- `i18n/locales/` contains flat locale JSON files. Treat `i18n/locales/en.json` as the source of truth for keys and placeholders.

## External Services and Environment Variables
- Strapi backs portfolio content through the `/api/about-me`, `/api/projects`, and `/api/tech-stacks` proxy routes. Configure `NUXT_STRAPI_API_BASE` and `NUXT_STRAPI_READ_ONLY_TOKEN`.
- Wise backs the currency converter through `/api/wise-currencies` and `/api/wise-rates`. Configure `NUXT_WISE_API_BASE` and `NUXT_WISE_READ_ONLY_TOKEN`.
- OpenAI backs the typing-game passage and coaching feedback routes. Configure `NUXT_OPENAI_API_KEY`.
- The treasury-yield visualiser fetches historical CSV data and scrapes recent yield data from `home.treasury.gov`.

## SEO Rules
- Preserve SSR rendering.
- Prefer semantic HTML.
- Each page should have a unique title and description.
- Use useSeoMeta for page metadata.
- Preserve canonical URLs and hreflang tags.
- Avoid introducing client-only rendering for important content.
- Do not remove prerendered routes without justification.

## Routing Rules
- Preserve existing URL structures.
- Do not rename routes without explanation.
- Locale routes must remain consistent across languages.
- New pages should integrate with sitemap generation.
- Consider SEO impact before introducing dynamic routes.

## i18n Rules
- Supported locales:
  - en
  - zh
  - th
  - tr
- English is the source locale.
- New translation keys must first be added to en.json.
- Do not hardcode user-facing text.
- Prefer existing translation keys before creating new ones.

## Content Ownership
- Portfolio content originates from Strapi unless otherwise specified.
- Do not move CMS-managed content into static files.
- Maintain compatibility between frontend expectations and Strapi response structures.
- Preserve existing API contracts when possible.

## Editing Conventions
- Preserve the repository ESLint style: semicolons are required, and existing single-quote usage should remain consistent.
- Keep user-facing strings in all locale files rather than hard-coding translated UI copy in components or pages.
- When adding a project detail page, update the page metadata, shared navigation/headings where applicable, Strapi content expectations, and locale keys together.
- Prefer existing Nuxt composables such as `useFetch`, `useSeoMeta`, `useHead`, and runtime config helpers over introducing parallel patterns.
- Do not commit generated output or local-only files such as `.nuxt/`, `.output/`, `node_modules/`, or `.env` files.

## Agent Behaviour
Before making changes:
1. Explain the problem.
2. Explain the proposed solution.
3. Identify impacted files.
4. Prefer minimal changes.
5. Avoid large refactors unless requested.
When unsure:
- Ask for clarification.
- Do not guess business requirements.