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

export type TurnstileResponse = {
  success: boolean
};

export type StrapiPagination = {
  page: number
  pageSize: number
  pageCount: number
  total: number
};
export type StrapiMeta = {
  pagination: StrapiPagination
};

type ImageData = {
  id: number
  url: string
  name: string
  ext: string
  mime: string
  size: number
  width: number
  height: number
  provider: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  alternativeText: string
};

export type TechStackResponse = {
  id: number
  documentId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string
  website: string
  purpose: string
  logo: ImageData
};

export type AvatarFormat = {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  path: string | null
  size: number
  width: number
  height: number
  sizeInBytes: number
}

export type AvatarImage = {
  documentId: string
  name: string
  alternativeText: string | undefined
  width: number | undefined
  height: number | undefined
  mime: 'image/jpeg' | 'image/gif' | 'image/png' | undefined
  size: number
  url: string | undefined
};

type Avatar = {
  id: number
  image: AvatarImage
};

type SocialMediaItem = {
  id: number
  sortIndex: number
  platform: string
  type: 'personal' | 'work'
  url: string
  icon: string
  description: string | null
};

export type AboutMeResponse = {
  id: number
  documentId: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string
  aboutMe: string | null
  og_banner: Avatar
  avatar_light: Avatar
  avatar_dark: Avatar
  hero_light: Avatar
  hero_dark: Avatar
  socialMedia: Array<SocialMediaItem>
};
export type TreasuryChartRowData = {
  'date': string
  '3mth': number
  '2yr': number
  '10yr': number
};

export type Project = {
  id: number
  documentId: string
  title: string
  description: string
  tag: string
  sortIndex: number
  createdAt: string // ISO timestamp
  updatedAt: string
  publishedAt: string
  locale: string
  identifier: string
};
export type ProjectItemData = {
  data: Array<{
    description: string | undefined
  } & { preview: { image: AvatarImage } }>
};
export type CurrencyItem = {
  code: string
  symbol: string
  name: string
  countryKeywords: Array<string>
  supportsDecimals: boolean
};
export type CurrenciesListComputed = {
  label: string
  value: string
  avatar: {
    src: string
    alt: string
  }
  code: string
  symbol: string
  name: string
  countryKeywords: Array<string>
  supportsDecimals: boolean
}
export type RatesItem = {
  rate: number
  source: string
  target: string
  time: string
};

export type Character = {
  char: string
  display: string
  expectedKey: string
  lastTypedKey: string | undefined
  status: 'pending' | 'correct' | 'wrong'
  numberOfTry: number
  firstTryAt: number | undefined
};

export type TypingGameFeedbackRequestCharacter = {
  expectedKey: string
  lastTypedKey: string | undefined
  status: 'pending' | 'correct' | 'wrong'
  numberOfTry: number
  firstTryAt: number | undefined
};
export type TypingGameGptFeedbackPayload = {
  result: TypingGameFeedbackRequestCharacter[]
  rawWpm: number
  rawAccuracy: number
  finalWpm: number
  finalAccuracy: number
};
export type TypingGameUpdatedData = {
  id: string
  topic: string
  mappedPassage: Character[]
};

export type YearPickerTypeRange = {
  start: number | null
  end: number | null
}
