import { z } from 'zod';
import type { CalendarDate } from '@internationalized/date';

export const CalendarDateValueSchema = z.object({
  year: z.coerce.number().int().min(1).max(9999),
  month: z.coerce.number().int().min(1).max(12), // conforming @internationalized/date
  day: z.coerce.number().int().min(1).max(31),
});
export type CalendarDateValue = z.infer<typeof CalendarDateValueSchema>;

export const ImageDataSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  name: z.string(),
  ext: z.string(),
  mime: z.string(),
  size: z.number(),
  width: z.number(),
  height: z.number(),
  provider: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  alternativeText: z.string(),
});
export type ImageData = z.infer<typeof ImageDataSchema>;

const TagItemSchema = z.object({
  id: z.number(),
  tag: z.string(),
  description: z.string().optional(),
});

export const TechStackResponseSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  website: z.string().url(),
  tech_stack_tags: z.array(TagItemSchema),
  icon_default: ImageDataSchema,
  icon_dark: ImageDataSchema,
});
export type TechStackResponse = z.infer<typeof TechStackResponseSchema>;

export const AvatarImageSchema = z.object({
  documentId: z.string(),
  name: z.string(),
  alternativeText: z.string(),
  width: z.number(),
  height: z.number(),
  mime: z.enum(['image/jpeg', 'image/gif', 'image/png']),
  size: z.number(),
  url: z.string().url(),
});
export type AvatarImage = z.infer<typeof AvatarImageSchema>;

const AvatarSchema = z.object({
  id: z.number(),
  image: AvatarImageSchema,
});

export const ProjectItemDataSchema = z.object({
  description: z.string(),
  preview: z.object({
    image: AvatarImageSchema,
  }),
});
export type ProjectItemData = z.infer<typeof ProjectItemDataSchema>;

export const SocialMediaItemSchema = z.object({
  id: z.number(),
  sortIndex: z.number(),
  platform: z.string(),
  type: z.enum(['personal', 'work']),
  url: z.string().url(),
  icon: z.string(),
  description: z.string().nullable(),
});
export type SocialMediaItem = z.infer<typeof SocialMediaItemSchema>;

export const AboutMeResponseSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  aboutMe: z.string().nullable(),
  og_banner: AvatarSchema,
  avatar_light: AvatarSchema,
  avatar_dark: AvatarSchema,
  hero_light: AvatarSchema,
  hero_dark: AvatarSchema,
  socialMedia: z.array(SocialMediaItemSchema),
});
export type AboutMeResponse = z.infer<typeof AboutMeResponseSchema>;

export const ProjectSlugIDSchema = z.enum([
  'treasury-yield-visualiser',
  'currency-converter',
  'typing-game',
  'know-your-viewport',
  'cloudflare-turnstile-demo',
]);
export type ProjectSlugID = z.infer<typeof ProjectSlugIDSchema>;

export const ProjectSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  description: z.string(),
  tag: z.string(),
  sortIndex: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  slugId: ProjectSlugIDSchema,
});
export type Project = z.infer<typeof ProjectSchema>;

// see https://github.com/unjs/ufo/blob/main/src/query.ts (not sure how to import these)
export type QueryValue =
  | string
  | number
  | undefined
  | null
  | boolean
  | Array<QueryValue>
  | Record<string, unknown>;
export type QueryObject = Record<string, QueryValue | Array<QueryValue>>;

// https://nuxt.com/docs/3.x/api/composables/use-fetch#type
export type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'

export type PickerTypeRange = {
  start: CalendarDate | null
  end: CalendarDate | null
}

export type ProjectItemPageMeta = {
  layout: 'project-item' // layouts/project/item.vue
  slugId: ProjectSlugID
  slugLabel: string
}

export type DeviceType = 'Phone' | 'Tablet' | 'Desktop';
export type DeviceOrientation = 'portrait' | 'landscape'; // based on window.innerWidth/innerHeight
export type DeviceOrientationDetail = 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';
