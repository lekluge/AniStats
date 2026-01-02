export type TasteProfile = {
  genres: Map<string, number>;
  tags: Map<number, number>;
  negativeGenres: Map<string, number>;
  negativeTags: Map<number, number>;
  unseenGenres: Map<string, number>;
  unseenTags: Map<number, number>;
};