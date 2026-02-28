import type { AnimeEntry } from "~/types/anime";

export interface ApiGenreTagItem {
  id: number;
  name: string;
  category: string | null;
  isAdult: boolean;
  rank: number | null;
}

export interface ApiGenreTagsResponse {
  genres: string[];
  tags: ApiGenreTagItem[];
}

export interface ApiRecommendationItem {
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  cover: string | null;
  format: "TV" | "MOVIE";
  score: number;
  genres: string[];
  tags: string[];
  matchedGenres: string[];
  matchedTags: string[];
}

export interface ApiRecommendationResponse {
  user: string;
  total: number;
  items: {
    TV: ApiRecommendationItem[];
    MOVIE: ApiRecommendationItem[];
  };
}

export interface ApiRelationTag {
  id: number;
  name: string;
  rank: number | null;
  isAdult: boolean;
}

export interface ApiRelationItem {
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  cover: string | null;
  relationType: string;
  genres: string[];
  tags: ApiRelationTag[];
}

export interface ApiRelationChainItem {
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  cover: string | null;
  genres: string[];
  tags: ApiRelationTag[];
  related: ApiRelationItem[];
}

export interface ApiRelationGroup {
  rootId: number;
  chainLength: number;
  chain: ApiRelationChainItem[];
}

export interface ApiRelationsResponse {
  ok: true;
  count: number;
  groups: ApiRelationGroup[];
}

export interface ApiUserListResponse {
  ok: boolean;
  user: string;
  count: number;
  statusMap: Record<number, string>;
}

export interface ApiAnilistResponse {
  data: {
    MediaListCollection: {
      lists: unknown[];
    };
  };
}

export interface CompareAnimeItem {
  id: number;
  titleEn: string;
  titleRo: string;
  title: string;
  cover: string | null;
  genres: string[];
  tags: ApiRelationTag[];
  related: ApiRelationItem[];
  users: Record<string, AnimeEntry>;
}
