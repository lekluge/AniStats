export interface FuzzyDate {
  year: number
  month: number
  day: number
}

export interface AniGraphQLError {
  message: string
}

export interface AniGraphQLResponse<TData> {
  data?: TData
  errors?: AniGraphQLError[]
}

export interface AniListCollection<TEntry> {
  MediaListCollection?: {
    lists?: Array<{
      entries?: TEntry[] | null
    } | null>
  } | null
}

export interface AniUserStatusEntry {
  mediaId?: number | null
  status?: string | null
}

export interface AniUserMediaEntry {
  status?: string | null
  score?: number | null
  progress?: number | null
  completedAt?: FuzzyDate | null
  startedAt?: FuzzyDate | null
  media?: {
    id?: number | null
    season?: string | null
    seasonYear?: number | null
    duration?: number | null
    episodes?: number | null
    countryOfOrigin?: string | null
  } | null
}

export interface AniHistoryPageData {
  Page?: {
    pageInfo?: {
      hasNextPage?: boolean | null
    } | null
    mediaList?: Array<{
      mediaId: number
      startedAt?: FuzzyDate | null
      completedAt?: FuzzyDate | null
    }> | null
  } | null
}
