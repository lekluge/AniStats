import { describe, expect, it } from "vitest";
import { normalizeAnilist } from "~/utils/normalizeAnilist";

describe("normalizeAnilist", () => {
  it("deduplicates duplicate media across lists", () => {
    const lists = [
      {
        entries: [
          {
            status: "COMPLETED",
            score: 60,
            progress: 8,
            startedAt: { year: 2024, month: 1, day: 2 },
            media: {
              id: 101,
              episodes: 12,
              duration: 24,
              format: "TV",
              countryOfOrigin: "JP",
              genres: ["Action"],
              tags: [{ name: "Magic", rank: 50 }],
              title: { romaji: "First", english: "First EN" },
              coverImage: { large: "cover-a" },
            },
          },
        ],
      },
      {
        entries: [
          {
            status: "COMPLETED",
            score: 85,
            progress: 12,
            completedAt: { year: 2024, month: 2, day: 10 },
            media: {
              id: 101,
              episodes: 12,
              duration: 24,
              genres: ["Fantasy"],
              tags: [{ name: "Magic", rank: 80 }, { name: "School", rank: 30 }],
              title: { romaji: "First", english: "First EN" },
              coverImage: { extraLarge: "cover-b" },
            },
          },
        ],
      },
    ];

    const result = normalizeAnilist(lists);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 101,
      status: "COMPLETED",
      score: 85,
      progress: 12,
      genres: expect.arrayContaining(["Action", "Fantasy"]),
      startedAt: { year: 2024, month: 1, day: 2 },
      completedAt: { year: 2024, month: 2, day: 10 },
      coverImage: "cover-a",
    });
    expect(result[0].tags).toEqual(
      expect.arrayContaining([
        { name: "Magic", rank: 80 },
        { name: "School", rank: 30 },
      ])
    );
  });

  it("keeps unique media entries", () => {
    const lists = [
      {
        entries: [
          { media: { id: 1 } },
          { media: { id: 2 } },
        ],
      },
      {
        entries: [{ media: { id: 3 } }],
      },
    ];

    const result = normalizeAnilist(lists);
    expect(result.map((entry) => entry.id).sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });
});
