export interface FuzzyDate {
  year?: number | null
  month?: number | null
  day?: number | null
}

export interface AnimeTitle {
  romaji?: string | null
  english?: string | null
}

export interface AnimeTag {
  name: string
  rank: number
}

export interface AnimeEntry {
  id: number
  status: string
  score: number
  progress: number
  duration: number | null
  episodes: number | null
  format: string | null
  countryOfOrigin: string | null
  genres: string[]
  tags: AnimeTag[]
  seasonYear: number | null
  startedAt: FuzzyDate | null
  completedAt: FuzzyDate | null
  coverImage: string | null
  title: AnimeTitle
}
