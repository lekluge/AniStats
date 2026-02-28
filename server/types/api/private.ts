import type { Prisma } from "@prisma/client"

export type AnimeWithGenresTags = Prisma.AnimeGetPayload<{
  include: { genres: true; tags: true }
}>

export type AnimeWithRelations = Prisma.AnimeGetPayload<{
  include: { relationsFrom: true; relationsTo: true }
}>

export type AnimeWithRelationsAndMeta = Prisma.AnimeGetPayload<{
  include: { relationsFrom: true; relationsTo: true; genres: true; tags: true }
}>

export interface GenreTagCache {
  genres: Array<{ name: string }>
  tags: Array<{
    id: number
    name: string
    category: string | null
    isAdult: boolean
    rank: number | null
  }>
}

export interface RecommendationItem {
  id: number
  titleEn: string | null
  titleRo: string | null
  cover: string | null
  format: string | null
  score: number
  averageScore: number | null
  season: string | null
  seasonYear: number | null
  episodes: number | null
  genres: string[]
  tags: string[]
  matchedGenres: string[]
  matchedTags: string[]
}

export interface RelationTag {
  id: number
  name: string
  rank: number | null
  isAdult: boolean
}

export interface RelationItem {
  id: number
  titleEn: string | null
  titleRo: string | null
  cover: string | null
  relationType: string
  genres: string[]
  tags: RelationTag[]
}

export interface ChainItem {
  id: number
  titleEn: string | null
  titleRo: string | null
  cover: string | null
  genres: string[]
  tags: RelationTag[]
  related: RelationItem[]
}

export interface RelationGroup {
  rootId: number
  chainLength: number
  chain: ChainItem[]
}

export interface RelationResponse {
  ok: true
  count: number
  groups: RelationGroup[]
}
