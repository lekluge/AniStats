import { describe, expect, it, vi, beforeEach } from "vitest";
import { performance } from "node:perf_hooks";

const state = vi.hoisted(() => ({
  query: {} as Record<string, any>,
  cache: new Map<string, any>(),
  useRealRecommendationModules: false,
}));

const prismaAnimeFindManyMock = vi.hoisted(() => vi.fn(async () => []));
const prismaAnimeGenreFindManyMock = vi.hoisted(() => vi.fn(async () => []));
const prismaAnimeTagFindManyMock = vi.hoisted(() => vi.fn(async () => []));
const prismaAnimeRelationFindManyMock = vi.hoisted(() => vi.fn(async () => []));
const loadUserEntriesMock = vi.hoisted(() => vi.fn(async () => []));
const loadGlobalStatsMock = vi.hoisted(() =>
  vi.fn(async () => ({
    totalAnime: 10000,
    genreCount: new Map<string, number>(),
    tagCount: new Map<number, number>(),
  }))
);
const buildTasteProfileMock = vi.hoisted(() =>
  vi.fn(() => ({
    genres: new Map<string, number>([["Action", 1]]),
    tags: new Map<number, number>([[1, 1]]),
    negativeGenres: new Map<string, number>(),
    negativeTags: new Map<number, number>(),
    unseenGenres: new Map<string, number>(),
    unseenTags: new Map<number, number>(),
  }))
);
const scoreAnimeMock = vi.hoisted(() =>
  vi.fn(() => ({
    score: 0.72,
    matchedGenres: ["Action"],
    matchedTags: ["School"],
  }))
);
const buildChainMapFromEdgesMock = vi.hoisted(() =>
  vi.fn(() => new Map<number, number[]>())
);
const isFirstUnseenInChainMock = vi.hoisted(() => vi.fn(() => true));

vi.mock("h3", () => ({
  defineEventHandler: (handler: any) => handler,
  getQuery: () => state.query,
  setHeader: vi.fn(),
  createError: (input: { statusCode: number; statusMessage: string }) => {
    const err = new Error(input.statusMessage) as any;
    err.statusCode = input.statusCode;
    err.statusMessage = input.statusMessage;
    return err;
  },
}));

vi.mock("../../utils/prisma", () => ({
  prisma: {
    anime: {
      findMany: prismaAnimeFindManyMock,
    },
    animeGenre: {
      findMany: prismaAnimeGenreFindManyMock,
    },
    animeTag: {
      findMany: prismaAnimeTagFindManyMock,
    },
    animeRelation: {
      findMany: prismaAnimeRelationFindManyMock,
    },
  },
}));

vi.mock("../../server/recommend/anilist", async () => {
  const actual = await vi.importActual<typeof import("../../server/recommend/anilist")>(
    "../../server/recommend/anilist"
  );
  return {
    ...actual,
    loadUserAnilistEntries: async (...args: [string]) => {
      if (state.useRealRecommendationModules) {
        return actual.loadUserAnilistEntries(...args);
      }
      return loadUserEntriesMock(...args);
    },
  };
});

vi.mock("../../server/recommend/globalStats", async () => {
  const actual = await vi.importActual<
    typeof import("../../server/recommend/globalStats")
  >("../../server/recommend/globalStats");
  return {
    ...actual,
    loadGlobalStats: async (...args: [any]) => {
      if (state.useRealRecommendationModules) {
        return actual.loadGlobalStats(...args);
      }
      return loadGlobalStatsMock(...args);
    },
  };
});

vi.mock("../../server/recommend/tasteProfile", async () => {
  const actual = await vi.importActual<
    typeof import("../../server/recommend/tasteProfile")
  >("../../server/recommend/tasteProfile");
  return {
    ...actual,
    buildTasteProfile: (...args: any[]) => {
      if (state.useRealRecommendationModules) {
        return actual.buildTasteProfile(...args);
      }
      return buildTasteProfileMock(...args);
    },
  };
});

vi.mock("../../server/recommend/scoring", async () => {
  const actual = await vi.importActual<typeof import("../../server/recommend/scoring")>(
    "../../server/recommend/scoring"
  );
  return {
    ...actual,
    scoreAnime: (...args: any[]) => {
      if (state.useRealRecommendationModules) {
        return actual.scoreAnime(...args);
      }
      return scoreAnimeMock(...args);
    },
  };
});

vi.mock("../../server/recommend/chain", async () => {
  const actual = await vi.importActual<typeof import("../../server/recommend/chain")>(
    "../../server/recommend/chain"
  );
  return {
    ...actual,
    buildChainMapFromEdges: (...args: any[]) => {
      if (state.useRealRecommendationModules) {
        return actual.buildChainMapFromEdges(...args);
      }
      return buildChainMapFromEdgesMock(...args);
    },
    isFirstUnseenInChain: (...args: any[]) => {
      if (state.useRealRecommendationModules) {
        return actual.isFirstUnseenInChain(...args);
      }
      return isFirstUnseenInChainMock(...args);
    },
  };
});

function makeAnime(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    titleEn: `Anime ${i + 1}`,
    titleRo: `Anime ${i + 1}`,
    cover: null,
    format: i % 5 === 0 ? "MOVIE" : "TV",
    averageScore: 70 + (i % 20),
    season: "SPRING",
    startYear: 2015 + (i % 10),
    startMonth: 1,
    startDay: 1,
    episodes: 12 + (i % 24),
    genres: [{ name: "Action" }, { name: "Drama" }],
    tags: [
      { name: "School", tagId: 1, rank: 80, isAdult: false },
      { name: "Comedy", tagId: 2, rank: 60, isAdult: false },
    ],
    relationsFrom: [],
    relationsTo: [],
  }));
}

function extractGenres(
  anime: ReturnType<typeof makeAnime>
): Array<{ animeId: number; name: string }> {
  const out: Array<{ animeId: number; name: string }> = [];
  for (const row of anime) {
    for (const genre of row.genres) {
      out.push({ animeId: row.id, name: genre.name });
    }
  }
  return out;
}

function extractTags(
  anime: ReturnType<typeof makeAnime>
): Array<{ animeId: number; name: string; tagId: number; rank: number; isAdult: boolean }> {
  const out: Array<{
    animeId: number;
    name: string;
    tagId: number;
    rank: number;
    isAdult: boolean;
  }> = [];
  for (const row of anime) {
    for (const tag of row.tags) {
      out.push({
        animeId: row.id,
        name: tag.name,
        tagId: tag.tagId,
        rank: tag.rank,
        isAdult: tag.isAdult,
      });
    }
  }
  return out;
}

describe("performance baseline", () => {
  beforeEach(() => {
    vi.resetModules();
    state.query = {};
    state.cache.clear();
    state.useRealRecommendationModules = false;
    prismaAnimeFindManyMock.mockReset();
    prismaAnimeGenreFindManyMock.mockReset();
    prismaAnimeTagFindManyMock.mockReset();
    prismaAnimeRelationFindManyMock.mockReset();
    loadUserEntriesMock.mockReset();
    loadGlobalStatsMock.mockClear();
    buildTasteProfileMock.mockClear();
    scoreAnimeMock.mockClear();
    buildChainMapFromEdgesMock.mockClear();
    isFirstUnseenInChainMock.mockClear();

    (globalThis as any).useStorage = () => ({
      getItem: async (key: string) => state.cache.get(key) ?? null,
      setItem: async (key: string, value: any) => {
        state.cache.set(key, value);
      },
    });
  });

  it("measures recommendation handler throughput with large dataset", async () => {
    const anime = makeAnime(4000);
    state.query = { user: "perf-user", includeUpcoming: "true" };
    loadUserEntriesMock.mockResolvedValueOnce(
      Array.from({ length: 800 }, (_, i) => ({
        mediaId: i + 1,
        status: "COMPLETED",
        score: 8,
      }))
    );
    prismaAnimeFindManyMock.mockResolvedValueOnce(anime);
    prismaAnimeGenreFindManyMock.mockResolvedValueOnce(extractGenres(anime));
    prismaAnimeTagFindManyMock.mockResolvedValueOnce(extractTags(anime));
    prismaAnimeRelationFindManyMock.mockResolvedValueOnce([]);

    const mod = await import("../../server/api/private/recommendation.get");

    const start = performance.now();
    const out = await mod.default({} as any);
    const end = performance.now();
    const ms = Number((end - start).toFixed(2));

    console.log(`[perf] recommendation.get 4000 anime: ${ms} ms`);
    expect(out.total).toBeGreaterThan(0);
    expect(ms).toBeLessThan(5000);
  });

  it("compares recommendation cold vs warm cache performance", async () => {
    const anime = makeAnime(4000);
    state.query = { user: "perf-user", includeUpcoming: "true" };
    loadUserEntriesMock.mockImplementation(async () =>
      Array.from({ length: 800 }, (_, i) => ({
        mediaId: i + 1,
        status: "COMPLETED",
        score: 8,
      }))
    );
    prismaAnimeFindManyMock.mockResolvedValueOnce(anime);
    prismaAnimeGenreFindManyMock.mockResolvedValueOnce(extractGenres(anime));
    prismaAnimeTagFindManyMock.mockResolvedValueOnce(extractTags(anime));
    prismaAnimeRelationFindManyMock.mockResolvedValueOnce([]);

    const mod = await import("../../server/api/private/recommendation.get");

    const coldStart = performance.now();
    const coldOut = await mod.default({} as any);
    const coldEnd = performance.now();
    const coldMs = Number((coldEnd - coldStart).toFixed(2));

    const warmStart = performance.now();
    const warmOut = await mod.default({} as any);
    const warmEnd = performance.now();
    const warmMs = Number((warmEnd - warmStart).toFixed(2));

    console.log(`[perf] recommendation cold: ${coldMs} ms, warm: ${warmMs} ms`);
    expect(coldOut.total).toBeGreaterThan(0);
    expect(warmOut.total).toBeGreaterThan(0);
    expect(prismaAnimeFindManyMock).toHaveBeenCalledTimes(1);
    expect(warmMs).toBeLessThan(coldMs * 1.25 + 5);
  });

  it.runIf(process.env.VITEST_PERF_REAL_USER === "1")(
    "measures recommendation handler with real AniList user Tiggy",
    async () => {
      const anime = makeAnime(4000);
      state.useRealRecommendationModules = true;
      state.query = { user: "Tiggy", includeUpcoming: "true" };

      prismaAnimeFindManyMock.mockResolvedValueOnce(anime);
      prismaAnimeGenreFindManyMock.mockResolvedValueOnce(extractGenres(anime));
      prismaAnimeTagFindManyMock.mockResolvedValueOnce(extractTags(anime));
      prismaAnimeRelationFindManyMock.mockResolvedValueOnce([]);

      const mod = await import("../../server/api/private/recommendation.get");

      const start = performance.now();
      const out = await mod.default({} as any);
      const end = performance.now();
      const ms = Number((end - start).toFixed(2));

      console.log(`[perf-live] recommendation.get Tiggy 4000 anime: ${ms} ms`);
      expect(out.user).toBe("Tiggy");
      expect(out.total).toBeGreaterThanOrEqual(0);
      expect(ms).toBeLessThan(15000);
    }
  );

  it("measures relations handler throughput with large dataset", async () => {
    const anime = makeAnime(4000);
    prismaAnimeFindManyMock.mockResolvedValueOnce(
      anime.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        titleRo: a.titleRo,
        cover: a.cover,
      }))
    );
    prismaAnimeGenreFindManyMock.mockResolvedValueOnce(extractGenres(anime));
    prismaAnimeTagFindManyMock.mockResolvedValueOnce(extractTags(anime));
    prismaAnimeRelationFindManyMock.mockResolvedValueOnce([]);

    const mod = await import("../../server/api/private/relations.get");

    const start = performance.now();
    const out = await mod.default({} as any);
    const end = performance.now();
    const ms = Number((end - start).toFixed(2));

    console.log(`[perf] relations.get 4000 anime: ${ms} ms`);
    expect(out.ok).toBe(true);
    expect(ms).toBeLessThan(5000);
  });

  it("compares relations cold vs warm cache performance", async () => {
    const anime = makeAnime(4000);
    prismaAnimeFindManyMock.mockResolvedValueOnce(
      anime.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        titleRo: a.titleRo,
        cover: a.cover,
      }))
    );
    prismaAnimeGenreFindManyMock.mockResolvedValueOnce(extractGenres(anime));
    prismaAnimeTagFindManyMock.mockResolvedValueOnce(extractTags(anime));
    prismaAnimeRelationFindManyMock.mockResolvedValueOnce([]);

    const mod = await import("../../server/api/private/relations.get");

    const coldStart = performance.now();
    const coldOut = await mod.default({} as any);
    const coldEnd = performance.now();
    const coldMs = Number((coldEnd - coldStart).toFixed(2));

    const warmStart = performance.now();
    const warmOut = await mod.default({} as any);
    const warmEnd = performance.now();
    const warmMs = Number((warmEnd - warmStart).toFixed(2));

    console.log(`[perf] relations cold: ${coldMs} ms, warm: ${warmMs} ms`);
    expect(coldOut.ok).toBe(true);
    expect(warmOut.ok).toBe(true);
    expect(warmMs).toBeLessThan(coldMs * 1.25 + 5);
  });
});
