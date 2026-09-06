<template>
  <img
    :src="src"
    :alt="props.alt ?? ''"
    :width="props.width ?? undefined"
    :height="props.height ?? undefined"
    :srcset="srcset"
    :sizes="props.sizes"
    :loading="props.loading"
    :decoding="props.decoding"
    :fetchpriority="props.fetchpriority" />
</template>

<script setup lang="ts">
import { Cloudinary } from '@cloudinary/url-gen';
import { scale } from '@cloudinary/url-gen/actions/resize';
import type { CloudinaryMedia } from '~~/schema-types/shared';

const props = withDefaults(defineProps<{
  publicId: CloudinaryMedia['publicId']
  alt?: string | null
  width?: number | null
  height?: number | null
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  fetchpriority?: 'high' | 'low' | 'auto'
  /** Widths of Cloudinary derivatives, in pixels; omit for original SVG icons. */
  srcsetWidths?: number[]
  /** Rendered image size, e.g. "(max-width: 640px) 100vw, 640px". */
  sizes?: string
}>(), {
  alt: '',
  loading: 'lazy',
  decoding: 'async',
  fetchpriority: 'auto',
});

const config = useRuntimeConfig();
const cloudinary = new Cloudinary({
  cloud: {
    cloudName: config.public.cloudinaryCloudName,
  },
  url: {
    analytics: false, // Prevent SDK analytics query parameters and SSR/client URL differences.
  },
});

const src = computed(() => cloudinary.image(props.publicId).toURL());

const srcset = computed(() => {
  const widths = [...new Set(props.srcsetWidths ?? [])]
    .filter(width => Number.isInteger(width) && width > 0)
    .sort((a, b) => a - b);

  return widths.length
    ? widths.map((width) => {
        const url = cloudinary.image(props.publicId).resize(scale().width(width)).toURL();
        return `${url} ${width}w`;
      }).join(', ')
    : undefined;
});
</script>
