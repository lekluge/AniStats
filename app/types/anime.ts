export interface AnimeEntry {
  status: string
  score: number
  progress: number
  duration: number | null
  episodes: number | null
  format?: string | null
  countryOfOrigin?: string | null
  genres: string[]
  tags: { name: string, rank: number }[]
  seasonYear: number | null
  startedAt?: { year: number; month: number; day: number }
  completedAt?: { year: number; month: number; day: number }
  coverImage?: string
  id: number,
  title: {romanji: string; english: string} | string
}
