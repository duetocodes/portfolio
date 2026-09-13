import { z } from 'zod';
import type { CalendarDate } from '@internationalized/date';

export const CalendarDateValueSchema = z.object({
  year: z.coerce.number().int().min(1).max(9999),
  month: z.coerce.number().int().min(1).max(12), // conforming @internationalized/date
  day: z.coerce.number().int().min(1).max(31),
});
export type CalendarDateValue = z.infer<typeof CalendarDateValueSchema>;

export const CloudinaryImageSchema = z.object({
  id: z.number(),
  publicId: z.string().min(1),
  alt: z.string().nullable(),
  width: z.number().int().nonnegative().nullable(),
  height: z.number().int().nonnegative().nullable(),
});
export type CloudinaryImage = z.infer<typeof CloudinaryImageSchema>;

export const TechStackResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      website: z.url(),
      tech_stack_tags: z.array(z.object({
        id: z.number(),
        tag: z.string(),
        description: z.string().nullable(),
      })),
      icon_default: CloudinaryImageSchema,
      icon_dark: CloudinaryImageSchema.nullable(),
    }),
  ),
  meta: z.object({
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      pageCount: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
  }),
});
export type TechStackResponse = z.infer<typeof TechStackResponseSchema>;

export const ProjectItemDataSchema = z.object({
  data: z.array(z.object({
    description: z.string(),
    ogSocialImage: CloudinaryImageSchema.nullish(),
  })),
});
export type ProjectItemData = z.infer<typeof ProjectItemDataSchema>;

export const AboutMeResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    aboutMe: z.string(),
    heroImage: CloudinaryImageSchema.nullable(),
    meImage: CloudinaryImageSchema.nullable(),
    socialMedia: z.array(z.object({
      id: z.number(),
      sortIndex: z.number(),
      platform: z.string(),
      type: z.enum(['personal', 'work']).nullable(),
      url: z.url(),
      icon: z.string(),
      description: z.string().nullable(),
    })),
  }),
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
  data: z.array(z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    tag: z.string().nullable(),
    sortIndex: z.number(),
    locale: z.string(),
    ogSocialImage: CloudinaryImageSchema.nullish(),
    slugId: ProjectSlugIDSchema,
  })),
});
export type Projects = z.infer<typeof ProjectSchema>;

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
