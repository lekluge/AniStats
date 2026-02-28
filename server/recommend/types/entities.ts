export interface RelationEdge {
  toId: number;
  relationType: string;
}

export interface GenreRef {
  name: string;
}

export interface TagRef {
  tagId: number;
  name: string;
  rank?: number | null;
}

export interface RecommendationAnime {
  id: number;
  startYear: number | null;
  startMonth: number | null;
  startDay: number | null;
  averageScore: number | null;
  genres: GenreRef[];
  tags: TagRef[];
}

export interface RecommendationAnimeWithRelations {
  id: number;
  relationsFrom?: RelationEdge[] | null;
}

export interface AnilistMediaListEntry {
  mediaId: number;
  status: string;
  score: number | null;
}
