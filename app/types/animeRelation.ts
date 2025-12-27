/* --------------------------------
 * Media / List Status
 * -------------------------------- */
export type MediaStatus =
  | "COMPLETED"
  | "CURRENT"
  | "PLANNING"
  | "PAUSED"
  | "DROPPED";

/* --------------------------------
 * Relation Types (AniList)
 * -------------------------------- */
export type RelationType =
  | "PREQUEL"
  | "SEQUEL"
  | "SIDE_STORY"
  | "SPIN_OFF"
  | "ADAPTATION"
  | "ALTERNATIVE"
  | "OTHER";

/* --------------------------------
 * Raw GraphQL Relation Edge
 * -------------------------------- */
export type RelationEdge = {
  relationType: RelationType;
  node: {
    id: number;
    title: {
      english?: string | null;
      romaji?: string | null;
    };
    coverImage?: {
      large?: string | null;
    };
  };
};

/* --------------------------------
 * Normalized Relation Item
 * -------------------------------- */
export type RelationGroupItem = {
  id: number;
  titleEn: string;
  titleRo: string;
  cover?: string;

  // Status nur vorhanden, wenn User den Anime in seiner Liste hat
  status?: MediaStatus;

  // Relation relativ zur Root-Serie
  relationLabel?: RelationType;
};

/* --------------------------------
 * Normalized Relation Group
 * -------------------------------- */
export type RelationGroup = {
  rootId: number;
  rootTitleEn: string;
  rootTitleRo: string;
  rootCover?: string;
  rootStatus?: MediaStatus;

  // PREQUEL → ROOT → SEQUEL (nur direkte Kette)
  chain: RelationGroupItem[];

  // SIDE_STORY, MOVIE, ADAPTATION, etc.
  related: RelationGroupItem[];
};
