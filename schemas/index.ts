import { z } from 'zod';

export const dateSchema = z.object({
  year: z.coerce.number().int().min(1).max(9999),
  month: z.coerce.number().int().min(1).max(12), // conforming @internationalized/date
  day: z.coerce.number().int().min(1).max(31),
});

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

const TagItem = z.object({
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
  tech_stack_tags: z.array(TagItem),
  icon_default: ImageDataSchema,
  icon_dark: ImageDataSchema,
});

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

export const SocialMediaItemSchema = z.object({
  id: z.number(),
  sortIndex: z.number(),
  platform: z.string(),
  type: z.enum(['personal', 'work']),
  url: z.string().url(),
  icon: z.string(),
  description: z.string().nullable(),
});

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
  slugId: z.string(),
});
